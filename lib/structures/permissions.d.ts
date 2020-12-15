import BitField from '../util/bitfield';
export declare const FLAGS: {
    [perm: string]: number;
};
declare class Permissions extends BitField {
    static FLAGS: {
        [perm: string]: number;
    };
}
export default Permissions;
