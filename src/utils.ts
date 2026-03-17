import { isEmpty, memoize, once } from "lodash-es";

export type DateMC = Date | string | { toDate: () => Date } | number;

export const EMPTY_ARRAY = Object.freeze([]) as any;
const logged = new Set();

export const normalizeArray = <T>(array: T[] | null | undefined) =>
  array?.length ? array : (EMPTY_ARRAY as T[]);

// eslint-disable-next-line no-console, no-sequences
export function console_log<T>(this: any, t: T, ...args: any[]) {
  console.log(this ?? "", t, ...args);
  return t;
}
// eslint-disable-next-line no-console, no-sequences
export const console_count = <T>(label: string, t: T) => (
  console.count(label),
  t
);

export const isBrowser = once(() => {
  try {
    return typeof window !== "undefined";
  } catch {
    return false;
  }
});

export function withParams(
  path: string,
  param: URLSearchParams,
  params2: Record<string, string>,
) {
  const params3 = new URLSearchParams(param);

  for (const p in params3) {
    if (Object.prototype.hasOwnProperty.call(params3, p)) {
      if (params2[p] == null) params3.delete(p);
      else params3.set(p, params2[p]);
    }
  }

  return `${path}?${params3}`;
}

export const tick = (timeout?: number) =>
  timeout
    ? new Promise<void>((res) => setTimeout(res, timeout))
    : new Promise(requestAnimationFrame);

export function staler() {
  let stale = false;
  return {
    isStale: () => stale,
    markStale() {
      stale = true;
    },
  };
}

export type IsStale = ReturnType<typeof staler>["isStale"];

export const fileToDataUrl = (file: File | Blob) =>
  new Promise<string>((res, rej) => {
    const reader = new FileReader();

    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;

    reader.readAsDataURL(file);
  });

export const blobToDataUrl = fileToDataUrl;

export const fileToText = (file: File) =>
  new Promise<string>((res, rej) => {
    const reader = new FileReader();

    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;

    reader.readAsText(file);
  });

export function ratioHeight(
  widthNew: number,
  {
    width,
    height,
    capHeight = widthNew * 2,
  }: { width: number; height: number; capHeight?: number },
) {
  const h = Math.floor((widthNew * height) / width);

  if (capHeight && capHeight > 0 && h > capHeight) {
    // eslint-disable-next-line no-console
    if (!logged.has(h))
      console.warn("height capped at: ", capHeight, ", ignoring height: ", h);
    logged.add(h);
    return capHeight;
  }

  return h;
}

function timeMills(date: DateMC | { seconds: number }) {
  if (isEmpty(date)) return 0;
  if (typeof date === "string") return new Date(date).getTime();
  if (date instanceof Date) return date.getTime();
  if ((date as any).toMillis) return (date as any).toMillis();
  if (typeof (date as any)?.seconds === "number")
    return (date as any).seconds * 1000;

  return 0;
}

export function dateComparator<T extends object, K extends keyof T>(key: K) {
  return (a: T, b: T) => timeMills(a[key] as any) - timeMills(b[key] as any);
}

export const currentTimeStamp = () => new Date();

export function updateSearchParams(params: Record<string, any>) {
  // eslint-disable-next-line no-restricted-globals
  const u = new URLSearchParams(location.search);
  // eslint-disable-next-line guard-for-in
  for (const key in params) {
    if (params[key] == null) u.delete(key);
    else u.set(key, params[key]);
  }

  return `?${u}`;
}

export function replaceSearchParams(params: Record<string, any>) {
  return history.replaceState(null, "", updateSearchParams(params));
}

export const omitNullFilter = <T>(t: T | undefined | null): t is T => !!t;

export const slice = <T>(data: T[], limit?: number) =>
  limit ? data.slice(0, limit) : data;

export function memoizeLocal<T extends (...args: any) => any>(
  ...params: Parameters<typeof memoize<T>>
) {
  const m = memoize(...params);
  m.cache = new Map();

  return m;
}

export function memoizeMono<T extends (...args: any) => any>(
  func: T,
  resolver: (...args: Parameters<T>) => any,
) {
  let cache: ReturnType<T>;
  let key = Symbol("NOT_INIT");

  return ((...args: Parameters<T>) => {
    const newKey = resolver(...args);

    if (newKey !== key) {
      key = newKey;
      cache = func(...args);
    }

    return cache;
  }) as T;
}

export function memoizeMonoPromise<T extends (...args: any) => Promise<any>>(
  func: T,
  resolver: (...args: Parameters<T>) => Promise<any> | any,
) {
  let cache: ReturnType<T>;
  let key = Symbol("NOT_INIT");

  return (async (...args: Parameters<T>) => {
    const newKey = await resolver(...args);

    if (newKey !== key) {
      console.debug("sameer", key, "->", newKey);
      key = newKey;
      cache = func(...args) as ReturnType<T>;
    }

    return cache;
  }) as T;
}

export const isNewId = (
  id: string | null | undefined,
): id is null | "new" | "undefined" | "null" =>
  !id?.trim() ||
  id.toLowerCase() === "new" ||
  id.toLowerCase() === "undefined" ||
  id.toLowerCase() === "null";

export function getIdError(id: string | null | undefined) {
  if (typeof id === "number") {
    if (isNaN(id)) return "NaN cannot be an id";
    if (id === 0) return "0 cannot be an id";
  }

  if (!id?.trim()) return "empty id not allowed";
  if (/\s/.test(id)) return `id includes spaces: ${JSON.stringify(id)}`;
  if (isNewId(id)) return "new as id not allowed";

  return null;
}
export function ensureValidId(
  id: string | null | undefined,
  label?: string,
): string {
  const err = getIdError(id);
  if (err) throw new Error(`${label ? `[${label}], ` : ""}${err}: ${id}`);

  return id!;
}

export const isIdValid = (id: string) => !getIdError(id);

export function convertObjectToArray<T>(data: Record<number, T> | T[]) {
  if (!data || Array.isArray(data)) return data;

  if (typeof data === "object") {
    const keys = Object.keys(data);

    if (keys.length === 0) return [];
    if (keys.every((t) => /^\d+$/.test(t))) return Object.values(data);
  }

  console.debug("convertObjectToArray: failed to convert", data);

  return data;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notImplemented =
  () =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (...args: any): any => {
    throw new Error("not implemented");
  };

export const dataURLtoBlob = (dataUrl: string) =>
  fetch(dataUrl).then((res) => res.blob());

export const placeholders = (count: number) => ",?".repeat(count).substring(1);

export function addToSet<T>(set: Set<T>, value: T) {
  const n = set.size;
  set.add(value);

  return n !== set.size;
}

export const wrapPromise = <T>(
  result: Promise<T>,
): Promise<readonly [T, null] | readonly [null, any]> =>
  result.then((t) => [t, null] as const).catch((e) => [null, e] as const);
