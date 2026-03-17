const NOT_INIT = Symbol();

export function memoizedByTime<T extends (...args: any) => any>(
  label: string,
  callback: T,
  delay: number
) {
  let time = 0;
  let cache: ReturnType<T> = NOT_INIT as any;
  let oldArg: any[] = [];

  return ((...args: any[]) => {
    if (
      time > Date.now() &&
      cache != NOT_INIT &&
      oldArg.length === args.length &&
      oldArg.every((t, i) => t === args[i])
    ) {
      return cache;
    }

    oldArg = args;
    time = Date.now() + delay;
    cache = callback(...args);

    return cache;
  }) as T;
}
