import { ResolvedChannel } from '../constants';
import Permissions from './permissions';
/** Represents a resolved channel object. */
declare class Channel {
    /** The channel's ID */
    readonly id: string;
    /** The channel's name */
    readonly name: string;
    /** The channel's type */
    readonly type: number;
    private _permissionsBitfield?;
    private _permissions;
    /**
     * @param data The data for the member
     * @param userData The data for the member's user
     * @param creator The instantiating creator
     */
    constructor(data: ResolvedChannel);
    /** The string that mentions this channel. */
    get mention(): string;
    /** The permissions the member has. */
    get permissions(): Permissions;
    /** @hidden */
    toString(): string;
}
export default Channel;
