export function isObjectShallowEquals<T extends object | null | undefined>(a: T, b: T) {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;

  for (const key in a) {
    // eslint-disable-next-line eqeqeq
    if ((a as any)[key] != (b as any)[key]) return false;
  }

  return true;
}
