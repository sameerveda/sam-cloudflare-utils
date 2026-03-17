import { chunk } from 'lodash-es';

export async function paginated<T, R>(
  array: T[],
  load: (part: T[], end: boolean) => Promise<R[]>,
  pageSize = 30
): Promise<R[]> {
  if (!array?.length) return Promise.resolve([] as R[]);
  if (array.length <= pageSize) return load(array, true);

  let result = [] as R[];

  for (const part of chunk(array, pageSize)) {
    result = [...result, ...(await load(part, part.length !== pageSize))];
  }

  return result;
}
