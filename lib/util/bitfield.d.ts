export declare type BitFieldResolvable = string | number | BitField | Array<BitFieldResolvable>;
/** Data structure that makes it easy to interact with a bitfield. */
declare class BitField {
    /** Bitfield of the packed bits. */
    bitfield: number;
    /** The flags for this bitfield. */
    static FLAGS: {
        [perm: string]: number;
    };
    /**
     * @param bits Bit(s) to read from.
     */
    constructor(bits?: BitFieldResolvable);
    /**
     * Checks whether the bitfield has a bit, or any of multiple bits.
     * @param bit Bit(s) to check for
     */
    any(bit: BitFieldResolvable): boolean;
    /**
     * Checks if this bitfield equals another.
     * @param bit Bit(s) to check for
     */
    equals(bit: BitFieldResolvable): boolean;
    /**
     * Checks whether the bitfield has a bit, or multiple bits.
     * @param bit Bit(s) to check for
     */
    has(bit: BitFieldResolvable): boolean;
    /**
     * Gets all given bits that are missing from the bitfield.
     * @param bits Bit(s) to check for
     */
    missing(bits: BitFieldResolvable): string[];
    /**
     * Gets an object mapping field names to a {@link boolean} indicating whether the
     * bit is available.
     */
    serialize(): {
        [key: string]: boolean;
    };
    /**
     * Gets an {@link Array} of bitfield names based on the bits available.
     */
    toArray(): string[];
    /** @private */
    toString(): string;
    /** @private */
    toJSON(): number;
    /** @private */
    valueOf(): number;
    /** @private */
    [Symbol.iterator](): Generator<string, void, undefined>;
    /**
     * Resolves bitfields to their numeric form.
     * @param bit Bit(s) to resolve
     */
    static resolve(bit?: BitFieldResolvable): number;
}
export default BitField;
