import BitField from '../util/bitfield';
export declare const FLAGS: {
    [perm: string]: number;
};
/** Data structure that makes it easy to interact with a {@link User#flags} bitfield. */
declare class UserFlags extends BitField {
    /** The flags for users. Check the source of this property for available flags. */
    static FLAGS: {
        [perm: string]: number;
    };
}
export default UserFlags;
