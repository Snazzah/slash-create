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
    /** The user object for this member */
    user: User;
    private _creator;
    private _permissionsBitfield?;
    private _permissions;
    constructor(data: CommandMember, creator: SlashCreator);
    /** The permissions the member has. */
    get permissions(): Permissions;
    get mention(): string;
    toString(): string;
    get displayName(): string;
}
export default Member;
