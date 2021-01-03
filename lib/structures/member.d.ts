import { CommandMember } from '../constants';
import SlashCreator from '../creator';
import Permissions from './permissions';
import User from './user';
declare class Member {
    /** The member's ID */
    readonly id: string;
    /** The member's nickname */
    readonly nick?: string;
    /** The timestamp the member joined the guild */
    readonly joinedAt: number;
    /** An array of role IDs that the user has. */
    readonly roles: string[];
    /** The time of when this member boosted the server. */
    readonly premiumSince?: number;
    /** Whether the user is muted in voice channels */
    readonly mute: boolean;
    /** Whether the user is deafened in voice channels */
    readonly deaf: boolean;
    /** Whether the member is pending verification */
    readonly pending: boolean;
    /** The user object for this member */
    readonly user: User;
    /** The creator of the member class. */
    private readonly _creator;
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
    /** @hidden */
    toString(): string;
    /** The display name for this member. */
    get displayName(): string;
}
export default Member;
