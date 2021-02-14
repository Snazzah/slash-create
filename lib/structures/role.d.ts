import { ResolvedRole } from '../constants';
import Permissions from './permissions';
/** Represents a resolved role object. */
declare class Role {
    /** The role's ID */
    readonly id: string;
    /** The role's name */
    readonly name: string;
    /** The role's position */
    readonly position: number;
    /** The role's color integer */
    readonly color: number;
    /** Whether the role is being hoisted */
    readonly hoist: boolean;
    /** Whether the role is being managed by an application */
    readonly managed: boolean;
    /** Whether the role is mentionable by everyone */
    readonly mentionable: boolean;
    private _permissionsBitfield?;
    private _permissions;
    /**
     * @param data The data for the member
     */
    constructor(data: ResolvedRole);
    /** The string that mentions this role. */
    get mention(): string;
    /** The role's color in hexadecimal, with a leading hashtag */
    get colorHex(): string;
    /** The permissions the member has. */
    get permissions(): Permissions;
    /** @hidden */
    toString(): string;
}
export default Role;
