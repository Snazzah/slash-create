import { CommandMember } from '../constants';
import SlashCreator from '../creator';
import Permissions from './permissions';
import User from './user';
declare class Member {
    /** The member's ID */
    id: string;
    /** The member's nickname */
    nick?: string;
    /** The timestamp the member joined the guild */
    joinedAt: number;
    /** An array of role IDs that the user has. */
    roles: string[];
    /** The time of when this member boosted the server. */
    premiumSince?: number;
    /** Whether the user is muted in voice channels */
    mute: boolean;
    /** Whether the user is deafened in voice channels */
    deaf: boolean;
    /** Whether the member is pending verification */
    pending: boolean;
    /** The user object for this member */
    user: User;
    /** The creator of the member class. */
    private _creator;
    private _permissionsBitfield?;
    private _permissions;
    /**
     * @param data The data for the member
     * @param creator The instantiating creator
     */
    constructor(data: CommandMember, creator: SlashCreator);
    /** The permissions the member has. */
    get permissions(): Permissions;
    /** The string that mentions this member. */
    get mention(): string;
    /** @private */
    toString(): string;
    /** The display name for this member. */
    get displayName(): string;
}
export default Member;
