import { InvalidParamError } from './errors';

export function toNumber(
  t: number | string | null | undefined,
  defaultValue?: number,
  label: string = ''
) {
  if (t == null)
    if (defaultValue == null) throw new InvalidParamError(`${label} expected a number, found null`);
    else return defaultValue;

  if (typeof t === 'number')
    if (isNaN(t)) throw new InvalidParamError(`${label} expected a number, found NaN`);
    else return t;

  return toNumber(+t, defaultValue, label);
}
