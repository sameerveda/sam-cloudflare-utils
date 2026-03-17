/**
 * an alternative to Map with size limit.
 */
export class RollMap<T, R> extends Map<T, R> {
  private _keys = [] as T[];

  constructor(private readonly limit = 10) {
    super();
  }

  override set(key: T, value: R): this {
    if (super.has(key)) return super.set(key, value);

    if (this._keys.length != super.size) this._keys = Array.from(super.keys());

    if (this._keys.length >= this.limit) {
      super.delete(this._keys.shift() as T);
    }

    this._keys.push(key);
    return super.set(key, value);
  }

  override delete(key: T): boolean {
    this._keys = this._keys.filter((t) => t !== key);
    return super.delete(key);
  }

  override clear(): void {
    this._keys = [];
    super.clear();
  }
}
