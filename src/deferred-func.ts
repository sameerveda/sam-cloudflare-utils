import { once } from 'lodash-es';

export function createDeferredFunc<F extends (...args: any[]) => any>() {
  let _callback = (() => {
    throw new Error('not implemented');
  }) as unknown as F;

  const callback = (...args: Parameters<F>) => _callback(...args) as ReturnType<F>;
  callback.init = once((c: F) => (_callback = c));

  return Object.freeze(callback);
}
