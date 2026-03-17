import { chunk, isEmpty, isNumber, mapValues, uniq } from 'lodash-es';

const typesKey = btoa('types');

export function encodeParams(params?: Record<string, any>) {
  if (isEmpty(params)) return '';

  const types = [] as string[];

  params = mapValues(params, (v, k) => {
    if (k === typesKey) return v;
    if (typeof v === 'string') return v;
    if (v == null) {
      types.push(k, '0');
      return undefined;
    }

    if (isNumber(v)) {
      types.push(k, 'n');
      return v;
    }

    if (Array.isArray(v)) {
      types.push(k, 'a');

      const invalid = v.filter((t) => typeof t === 'string' && t.includes(','));

      if (invalid.length) {
        console.error('value cannot have comma', invalid);
        throw new Error('value cannot have comma');
      }

      return v.join(',');
    }

    types.push(k, 'j');

    return JSON.stringify(v);
  });

  if (types.length) {
    params[typesKey] = types.join(',');
  } else {
    delete params[typesKey];
  }

  return new URLSearchParams(params).toString();
}

export function decodeParams(search?: URLSearchParams): Record<string, any> {
  if (!search?.size) return {};

  const types = Object.fromEntries(chunk((search.get(typesKey) as string)?.split(',') ?? [], 2));

  return Object.fromEntries(
    uniq([...search.keys(), ...Object.keys(types)]).map((k) => {
      const v = search.get(k) as string;
      if (!types[k]) return [k, v];

      switch (types[k]) {
        case '0':
          return [k, null];
        case 'n':
          return [k, Number(v)];
        case 'a':
          return [k, v.split(',').filter(Boolean)];
        case 'j':
          return [k, JSON.parse(v)];
        default:
          throw new Error(`unknown type: ${k}, ${v}`);
      }
    })
  );
}
