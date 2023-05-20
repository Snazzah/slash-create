import { CDN_URL, Endpoints, ImageFormat, ImageFormats, ImageSizeBoundaries, UserObject } from '../constants';
import { SlashCreator } from '../creator';
import { UserFlags } from './userFlags';

/** Represents a user on Discord. */
export class User {
  /** The user's ID. */
  readonly id: string;
  /** The user's username. */
  readonly username: string;
  /** The user's display name. */
  readonly globalName: string | null;
  /** The user's discriminator. */
  readonly discriminator: string;
  /** The user's avatar hash. */
  readonly avatar?: string;
  /** The user's avatar decoration hash. */
  readonly avatarDecoration?: string;
  /** Whether the user is a bot. */
  readonly bot: boolean;

  /** The creator of the user class. */
  private readonly _creator: SlashCreator;

  private _flagsBitfield?: UserFlags;
  private _flags: number;

  /**
   * @param data The data for the user
   * @param creator The instantiating creator
   */
  constructor(data: UserObject, creator: SlashCreator) {
    this._creator = creator;

    this.id = data.id;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.globalName = data.global_name;
    if (data.avatar) this.avatar = data.avatar;
    if (data.avatar_decoration) this.avatarDecoration = data.avatar_decoration;
    this._flags = data.public_flags;
    this.bot = data.bot || false;
  }

  /** The public flags for the user. */
  get flags() {
    if (!this._flagsBitfield) this._flagsBitfield = new UserFlags(this._flags);
    return this._flagsBitfield;
  }

  /** A string that mentions the user. */
  get mention() {
    return `<@${this.id}>`;
  }

  /** @hidden */
  toString() {
    return `[User ${this.id}]`;
  }

  /** The hash for the default avatar of a user if there is no avatar set. */
  get defaultAvatar() {
    if (this.discriminator === '0') return Number((BigInt(this.id) >> 22n) % 5n);
    return parseInt(this.discriminator) % 5;
  }

  /** The URL of the user's default avatar. */
  get defaultAvatarURL() {
    return `${CDN_URL}${Endpoints.DEFAULT_USER_AVATAR(this.defaultAvatar)}.png`;
  }

  /** The URL of the user's avatar. */
  get avatarURL() {
    return this.dynamicAvatarURL();
  }

  /**
   * Get the user's avatar with the given format and size.
   * @param format The format of the avatar
   * @param size The size of the avatar
   */
  dynamicAvatarURL(format?: ImageFormat, size?: number) {
    if (!this.avatar) return this.defaultAvatarURL;
    if (!format || !ImageFormats.includes(format.toLowerCase()))
      format = this.avatar.startsWith('a_') ? 'gif' : this._creator.options.defaultImageFormat;
    if (!size || size < ImageSizeBoundaries.MINIMUM || size > ImageSizeBoundaries.MAXIMUM || size & (size - 1))
      size = this._creator.options.defaultImageSize;

    return `${CDN_URL}${Endpoints.USER_AVATAR(this.id, this.avatar)}.${format}?size=${size}`;
  }

  /** The URL of the user's avatar decoration. */
  get avatarDecorationURL() {
    return this.dynamicAvatarDecorationURL();
  }

  /**
   * Get the user's avatar decoration with the given format and size.
   * @param format The format of the avatar
   * @param size The size of the avatar
   */
  dynamicAvatarDecorationURL(format?: ImageFormat, size?: number) {
    if (!this.avatarDecoration) return null;
    if (!format || !ImageFormats.includes(format.toLowerCase())) format = this._creator.options.defaultImageFormat;
    if (!size || size < ImageSizeBoundaries.MINIMUM || size > ImageSizeBoundaries.MAXIMUM || size & (size - 1))
      size = this._creator.options.defaultImageSize;

    let path = Endpoints.USER_AVATAR_DECORATION(this.id, this.avatarDecoration);
    if (this.avatarDecoration.startsWith('v2_')) path = Endpoints.USER_AVATAR_DECORATION_PRESET(this.avatarDecoration);

    return `${CDN_URL}${path}.${format}?size=${size}`;
  }
}
