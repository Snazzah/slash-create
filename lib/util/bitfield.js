"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Data structure that makes it easy to interact with a bitfield. */
class BitField {
    /** @param bits Bit(s) to read from. */
    constructor(bits = 0) {
        /** Bitfield of the packed bits. */
        this.bitfield = 0;
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
    any(bit) {
        // @ts-ignore
        return (this.bitfield & this.constructor.resolve(bit)) !== this.defaultBit;
    }
    /**
     * Checks if this bitfield equals another.
     * @param bit Bit(s) to check for
     */
    equals(bit) {
        // @ts-ignore
        return this.bitfield === this.constructor.resolve(bit);
    }
    /**
     * Checks whether the bitfield has a bit, or multiple bits.
     * @param bit Bit(s) to check for
     */
    has(bit) {
        if (Array.isArray(bit))
            return bit.every((p) => this.has(p));
        // @ts-ignore
        bit = this.constructor.resolve(bit);
        // @ts-ignore
        return (this.bitfield & bit) === bit;
    }
    /**
     * Gets all given bits that are missing from the bitfield.
     * @param bits Bit(s) to check for
     */
    missing(bits) {
        // @ts-ignore
        const bitsArray = new this.constructor(bits).toArray();
        return bitsArray.filter((p) => !this.has(p));
    }
    /**
     * Gets an object mapping field names to a {@link boolean} indicating whether the
     * bit is available.
     */
    serialize() {
        const serialized = {};
        // @ts-ignore
        for (const [flag, bit] of Object.entries(this.constructor.FLAGS))
            serialized[flag] = this.has(bit);
        return serialized;
    }
    /**
     * Gets an {@link Array} of bitfield names based on the bits available.
     */
    toArray() {
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
    static resolve(bit) {
        const defaultBit = this.name === 'Permissions' ? 0n : 0;
        if (typeof bit === 'undefined')
            return defaultBit;
        // Make sure bigint and numbers arent mixed
        if (typeof bit === 'bigint' && typeof defaultBit === 'number')
            bit = parseInt(bit.toString());
        else if (typeof bit === 'number' && typeof defaultBit === 'bigint')
            bit = BigInt(bit);
        if ((typeof bit === 'number' || typeof bit === 'bigint') && bit >= defaultBit)
            return bit;
        if (bit instanceof BitField)
            return bit.bitfield;
        if (Array.isArray(bit))
            return bit
                .map((p) => this.resolve(p))
                .reduce((prev, p) => prev | p, defaultBit);
        if (typeof bit === 'string' && typeof this.FLAGS[bit] !== 'undefined')
            return this.FLAGS[bit];
        throw new RangeError('BITFIELD_INVALID');
    }
}
/** The flags for this bitfield. */
BitField.FLAGS = {};
exports.default = BitField;
