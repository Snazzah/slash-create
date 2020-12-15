import { ImageFormat, CommandMember } from '../constants';
import SlashCreator from '../creator';
import Permissions from './permissions';
import UserFlags from './userFlags';
declare class Member {
    /** The member's nickname */
    nick?: string;
    /** The timestamp the member joined the guild */
    joinedAt: number;
    /** An array of role IDs that the user has. */
    roles: string[];
    premiumSince?: number;
    /** Whether the user is muted in voice channels */
    mute: boolean;
    /** Whether the user is deafened in voice channels */
    deaf: boolean;
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
    private _creator;
    private _permissionsBitfield?;
    private _permissions;
    private _userFlagsBitfield?;
    private _userFlags;
    constructor(data: CommandMember, creator: SlashCreator);
    /** The permissions the member has. */
    get permissions(): Permissions;
    /** The public flags for the user. */
    get userFlags(): UserFlags;
    get mention(): string;
    toString(): string;
    get displayName(): string;
    get defaultAvatar(): number;
    get defaultAvatarURL(): string;
    get avatarURL(): string;
    dynamicAvatarURL(format?: ImageFormat, size?: number): string;
}
export default Member;
