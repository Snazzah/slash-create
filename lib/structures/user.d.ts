import { ImageFormat, UserObject } from '../constants';
import SlashCreator from '../creator';
import UserFlags from './userFlags';
/** Represents a user on Discord. */
declare class User {
    /** The user's ID. */
    readonly id: string;
    /** The user's username. */
    readonly username: string;
    /** The user's discriminator. */
    readonly discriminator: string;
    /** The user's avatar hash. */
    readonly avatar?: string;
    /** Whether the user is a bot. */
    readonly bot: boolean;
    /** The creator of the user class. */
    private readonly _creator;
    private _flagsBitfield?;
    private _flags;
    /**
     * @param data The data for the user
     * @param creator The instantiating creator
     */
    constructor(data: UserObject, creator: SlashCreator);
    /** The public flags for the user. */
    get flags(): UserFlags;
    /** A string that mentions the user. */
    get mention(): string;
    /** @hidden */
    toString(): string;
    /** The hash for the default avatar of a user if there is no avatar set. */
    get defaultAvatar(): number;
    /** The URL of the user's default avatar. */
    get defaultAvatarURL(): string;
    /** The URL of the user's avatar. */
    get avatarURL(): string;
    /**
     * Get the user's avatar with the given format and size.
     * @param format The format of the avatar
     * @param size The size of the avatar
     */
    dynamicAvatarURL(format?: ImageFormat, size?: number): string;
}
export default User;
