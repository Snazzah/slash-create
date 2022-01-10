/* eslint-disable no-dupe-class-members */

/** A map with a subset of extra features from [@discordjs/collection](https://npm.im/@discordjs/collection). */
export class Collection<K, V> extends Map<K, V> {
  /**
   * Obtains unique random value(s) from this collection.
   * @param amount Amount of values to obtain randomly
   * @returns A single value if no amount is provided or an array of values
   */
  public random(): V;
  public random(amount: number): V[];
  public random(amount?: number): V | V[] {
    const arr = [...this.values()];
    if (typeof amount === 'undefined') return arr[Math.floor(Math.random() * arr.length)];
    if (!arr.length || !amount) return [];
    return Array.from(
      { length: Math.min(amount, arr.length) },
      (): V => arr.splice(Math.floor(Math.random() * arr.length), 1)[0]
    );
  }

  /**
   * Identical to
   * [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
   * but returns a Collection instead of an Array.
   * @param fn The function to test with (should return boolean)
   * @param thisArg Value to use as `this` when executing function
   * @example collection.filter(user => user.username === 'Bob');
   */
  public filter<K2 extends K>(fn: (value: V, key: K, collection: this) => key is K2): Collection<K2, V>;
  public filter<V2 extends V>(fn: (value: V, key: K, collection: this) => value is V2): Collection<K, V2>;
  public filter(fn: (value: V, key: K, collection: this) => boolean): Collection<K, V>;
  public filter<This, K2 extends K>(
    fn: (this: This, value: V, key: K, collection: this) => key is K2,
    thisArg: This
  ): Collection<K2, V>;
  public filter<This, V2 extends V>(
    fn: (this: This, value: V, key: K, collection: this) => value is V2,
    thisArg: This
  ): Collection<K, V2>;
  public filter<This>(fn: (this: This, value: V, key: K, collection: this) => boolean, thisArg: This): Collection<K, V>;
  public filter(fn: (value: V, key: K, collection: this) => boolean, thisArg?: unknown): Collection<K, V> {
    if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
    // @ts-ignore
    const results = new this.constructor[Symbol.species]<K, V>();
    for (const [key, val] of this) {
      if (fn(val, key, this)) results.set(key, val);
    }
    return results;
  }

  /**
   * Searches for a single item where the given function returns a truthy value. This behaves like
   * [Array.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find).
   * @param fn The function to test with (should return boolean)
   * @param thisArg Value to use as `this` when executing function
   * @example collection.find(user => user.username === 'Bob');
   */
  public find<V2 extends V>(fn: (value: V, key: K, collection: this) => value is V2): V2 | undefined;
  public find(fn: (value: V, key: K, collection: this) => boolean): V | undefined;
  public find<This, V2 extends V>(
    fn: (this: This, value: V, key: K, collection: this) => value is V2,
    thisArg: This
  ): V2 | undefined;
  public find<This>(fn: (this: This, value: V, key: K, collection: this) => boolean, thisArg: This): V | undefined;
  public find(fn: (value: V, key: K, collection: this) => boolean, thisArg?: unknown): V | undefined {
    if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
    for (const [key, val] of this) {
      if (fn(val, key, this)) return val;
    }
    return undefined;
  }

  /**
   * Maps each item to another value into an array. Identical in behavior to
   * [Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).
   * @param fn Function that produces an element of the new array, taking three arguments
   * @param thisArg Value to use as `this` when executing function
   * @example collection.map(user => user.tag);
   */
  public map<T>(fn: (value: V, key: K, collection: this) => T): T[];
  public map<This, T>(fn: (this: This, value: V, key: K, collection: this) => T, thisArg: This): T[];
  public map<T>(fn: (value: V, key: K, collection: this) => T, thisArg?: unknown): T[] {
    if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
    const iter = this.entries();
    return Array.from({ length: this.size }, (): T => {
      const [key, value] = iter.next().value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return fn(value, key, this);
    });
  }

  /**
   * Checks if there exists an item that passes a test. Identical in behavior to
   * [Array.some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some).
   * @param fn Function used to test (should return a boolean)
   * @param thisArg Value to use as `this` when executing function
   * @example collection.some(user => user.discriminator === '0000');
   */
  public some(fn: (value: V, key: K, collection: this) => boolean): boolean;
  public some<T>(fn: (this: T, value: V, key: K, collection: this) => boolean, thisArg: T): boolean;
  public some(fn: (value: V, key: K, collection: this) => boolean, thisArg?: unknown): boolean {
    if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
    for (const [key, val] of this) {
      if (fn(val, key, this)) return true;
    }
    return false;
  }

  /**
   * Removes items that satisfy the provided filter function.
   * @param fn Function used to test (should return a boolean)
   * @param thisArg Value to use as `this` when executing function
   * @returns The number of removed entries
   */
  public sweep(fn: (value: V, key: K, collection: this) => boolean): number;
  public sweep<T>(fn: (this: T, value: V, key: K, collection: this) => boolean, thisArg: T): number;
  public sweep(fn: (value: V, key: K, collection: this) => boolean, thisArg?: unknown): number {
    if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
    const previousSize = this.size;
    for (const [key, val] of this) {
      if (fn(val, key, this)) this.delete(key);
    }
    return previousSize - this.size;
  }

  /**
   * Checks if all items passes a test. Identical in behavior to
   * [Array.every()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every).
   * @param fn Function used to test (should return a boolean)
   * @param thisArg Value to use as `this` when executing function
   * @example collection.every(user => !user.bot);
   */
  public every<K2 extends K>(fn: (value: V, key: K, collection: this) => key is K2): this is Collection<K2, V>;
  public every<V2 extends V>(fn: (value: V, key: K, collection: this) => value is V2): this is Collection<K, V2>;
  public every(fn: (value: V, key: K, collection: this) => boolean): boolean;
  public every<This, K2 extends K>(
    fn: (this: This, value: V, key: K, collection: this) => key is K2,
    thisArg: This
  ): this is Collection<K2, V>;
  public every<This, V2 extends V>(
    fn: (this: This, value: V, key: K, collection: this) => value is V2,
    thisArg: This
  ): this is Collection<K, V2>;
  public every<This>(fn: (this: This, value: V, key: K, collection: this) => boolean, thisArg: This): boolean;
  public every(fn: (value: V, key: K, collection: this) => boolean, thisArg?: unknown): boolean {
    if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
    for (const [key, val] of this) {
      if (!fn(val, key, this)) return false;
    }
    return true;
  }

  /**
   * Applies a function to produce a single value. Identical in behavior to
   * [Array.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce).
   * @param fn Function used to reduce, taking four arguments; `accumulator`, `currentValue`, `currentKey`,
   * and `collection`
   * @param nitialValue Starting value for the accumulator
   * @example collection.reduce((acc, guild) => acc + guild.memberCount, 0);
   */
  public reduce<T>(fn: (accumulator: T, value: V, key: K, collection: this) => T, initialValue?: T): T {
    let accumulator!: T;

    if (typeof initialValue !== 'undefined') {
      accumulator = initialValue;
      for (const [key, val] of this) accumulator = fn(accumulator, val, key, this);
      return accumulator;
    }
    let first = true;
    for (const [key, val] of this) {
      if (first) {
        accumulator = val as unknown as T;
        first = false;
        continue;
      }
      accumulator = fn(accumulator, val, key, this);
    }

    // No items iterated.
    if (first) {
      throw new TypeError('Reduce of empty collection with no initial value');
    }

    return accumulator;
  }

  /**
   * Creates an identical shallow copy of this collection.
   * @example const newColl = someColl.clone();
   */
  public clone(): Collection<K, V> {
    // @ts-ignore
    return new this.constructor[Symbol.species](this);
  }

  /**
   * Combines this collection with others into a new collection. None of the source collections are modified.
   * @param collections Collections to merge
   * @example const newColl = someColl.concat(someOtherColl, anotherColl, ohBoyAColl);
   */
  public concat(...collections: Collection<K, V>[]): Collection<K, V> {
    const newColl = this.clone();
    for (const coll of collections) {
      for (const [key, val] of coll) newColl.set(key, val);
    }
    return newColl;
  }

  /**
   * Checks if this collection shares identical items with another.
   * This is different to checking for equality using equal-signs, because
   * the collections may be different objects, but contain the same data.
   * @param collection Collection to compare with
   * @returns Whether the collections have identical contents
   */
  public equals(collection: Collection<K, V>): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!collection) return false; // runtime check
    if (this === collection) return true;
    if (this.size !== collection.size) return false;
    for (const [key, value] of this) {
      if (!collection.has(key) || value !== collection.get(key)) {
        return false;
      }
    }
    return true;
  }
}
