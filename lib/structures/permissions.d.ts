import BitField from '../util/bitfield';
export declare const FLAGS: {
    [perm: string]: bigint;
};
/**
 * Data structure that makes it easy to interact with a permission bitfield.
 * All {@link Member}s have a set of permissions.
 */
declare class Permissions extends BitField {
    /** Permission flags. Check the source of this property for available permissions. */
    static FLAGS: {
        [perm: string]: bigint;
    };
}
export default Permissions;
