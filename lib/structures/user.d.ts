import { ImageFormat, UserObject } from '../constants';
import SlashCreator from '../creator';
import UserFlags from './userFlags';
declare class User {
    /** The user's ID */
    id: string;
    /** The user's username */
    username: string;
    /** The user's discriminator */
    discriminator: string;
    /** The user's avatar hash */
    avatar?: string;
    /** Whether the user is a bot */
    bot: boolean;
    private _creator;
    private _flagsBitfield?;
    private _flags;
    constructor(data: UserObject, creator: SlashCreator);
    /** The public flags for the user. */
    get flags(): UserFlags;
    get mention(): string;
    toString(): string;
    get defaultAvatar(): number;
    get defaultAvatarURL(): string;
    get avatarURL(): string;
    dynamicAvatarURL(format?: ImageFormat, size?: number): string;
}
export default User;
