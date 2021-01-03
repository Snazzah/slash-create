/* global BigInt */
export type BitFieldResolvable = string | number | bigint | BitField | Array<BitFieldResolvable>;

/** Data structure that makes it easy to interact with a bitfield. */
class BitField {
  /** Bitfield of the packed bits. */
  bitfield: number | bigint = 0;
  /** The flags for this bitfield. */
  static FLAGS: { [perm: string]: number | bigint } = {};

  /** @param bits Bit(s) to read from. */
  constructor(bits: BitFieldResolvable = 0) {
    // @ts-ignore
    this.bitfield = this.constructor.resolve(bits);
  }

  /** @private */
  get defaultBit() {
    return typeof this.bitfield === 'bigint' ? 0n : 0;
  }

  /**
   * Checks whether the bitfield has a bit, or any of multiple bits.
   * @param bit Bit(s) to check for
   */
  any(bit: BitFieldResolvable): boolean {
    // @ts-ignore
    return (this.bitfield & this.constructor.resolve(bit)) !== this.defaultBit;
  }

  /**
   * Checks if this bitfield equals another.
   * @param bit Bit(s) to check for
   */
  equals(bit: BitFieldResolvable): boolean {
    // @ts-ignore
    return this.bitfield === this.constructor.resolve(bit);
  }

  /**
   * Checks whether the bitfield has a bit, or multiple bits.
   * @param bit Bit(s) to check for
   */
  has(bit: BitFieldResolvable): boolean {
    if (Array.isArray(bit)) return bit.every((p) => this.has(p));
    // @ts-ignore
    bit = this.constructor.resolve(bit);
    // @ts-ignore
    return (this.bitfield & bit) === bit;
  }

  /**
   * Gets all given bits that are missing from the bitfield.
   * @param bits Bit(s) to check for
   */
  missing(bits: BitFieldResolvable): string[] {
    // @ts-ignore
    const bitsArray: string[] = new this.constructor(bits).toArray();
    return bitsArray.filter((p) => !this.has(p));
  }

  /**
   * Gets an object mapping field names to a {@link boolean} indicating whether the
   * bit is available.
   */
  serialize(): { [key: string]: boolean } {
    const serialized: { [key: string]: boolean } = {};
    // @ts-ignore
    for (const [flag, bit] of Object.entries(this.constructor.FLAGS))
      serialized[flag] = this.has(bit as BitFieldResolvable);
    return serialized;
  }

  /**
   * Gets an {@link Array} of bitfield names based on the bits available.
   */
  toArray(): string[] {
    // @ts-ignore
    return Object.keys(this.constructor.FLAGS).filter((bit) => this.has(bit));
  }

  /** @hidden */
  toString() {
    return `[${this.constructor.name} ${this.bitfield}]`;
  }

  /** @hidden */
  toJSON() {
    return typeof this.bitfield === 'number' ? this.bitfield : this.bitfield.toString();
  }

  /** @hidden */
  valueOf() {
    return this.bitfield;
  }

  /** @hidden */
  *[Symbol.iterator]() {
    yield* this.toArray();
  }

  /**
   * Resolves bitfields to their numeric form.
   * @param bit Bit(s) to resolve
   */
  static resolve(bit?: BitFieldResolvable): number | bigint {
    const defaultBit = this.name === 'Permissions' ? 0n : 0;
    if (typeof bit === 'undefined') return defaultBit;

    // Make sure bigint and numbers arent mixed
    if (typeof bit === 'bigint' && typeof defaultBit === 'number') bit = parseInt(bit.toString());
    else if (typeof bit === 'number' && typeof defaultBit === 'bigint') bit = BigInt(bit);

    if ((typeof bit === 'number' || typeof bit === 'bigint') && bit >= defaultBit) return bit;
    if (bit instanceof BitField) return bit.bitfield;
    if (Array.isArray(bit))
      return bit
        .map((p) => this.resolve(p))
        .reduce(<T extends number | bigint>(prev: T, p: T) => (prev as T) | (p as T), defaultBit);
    if (typeof bit === 'string' && typeof this.FLAGS[bit] !== 'undefined') return this.FLAGS[bit];
    throw new RangeError('BITFIELD_INVALID');
  }
}

export default BitField;
