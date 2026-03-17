export function nonNull<T>(value: T | null | undefined, message = 'not initialized') {
  if (value == null) throw new Error(message);

  return value;
}

export function ensureNonNull<T>(
  value: T | null | undefined,
  message = 'not initialized'
): value is T {
  if (value == null) throw new Error(message);

  return true;
}
