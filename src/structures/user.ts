import { CDN_URL, Endpoints, ImageFormat, ImageFormats, ImageSizeBoundaries, UserObject } from '../constants';
import SlashCreator from '../creator';
import Permissions from './permissions';
import UserFlags from './userFlags';

class User {
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

  private _creator: SlashCreator;

  private _flagsBitfield?: UserFlags;
  private _flags: number;

  constructor(data: UserObject, creator: SlashCreator) {
    this._creator = creator;

    this.id = data.id;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = data.avatar;
    this._flags = data.public_flags;
    this.bot = data.bot || false;
  }

  /** The public flags for the user. */
  get flags() {
    if (!this._flagsBitfield) this._flagsBitfield = new Permissions(this._flags);
    return this._flagsBitfield;
  }

  get mention() {
    return `<@${this.id}>`;
  }

  toString() {
    return `[User ${this.id}]`;
  }

  get defaultAvatar() {
    return parseInt(this.discriminator) % 5;
  }

  get defaultAvatarURL() {
    return `${CDN_URL}${Endpoints.DEFAULT_USER_AVATAR(this.defaultAvatar)}.png`;
  }

  get avatarURL() {
    return this.dynamicAvatarURL();
  }

  dynamicAvatarURL(format?: ImageFormat, size?: number) {
    if (!this.avatar) return this.defaultAvatarURL;
    if (!format || !ImageFormats.includes(format.toLowerCase())) {
      format = this.avatar.startsWith('a_') ? 'gif' : this._creator.options.defaultImageFormat;
    }
    if (!size || size < ImageSizeBoundaries.MINIMUM || size > ImageSizeBoundaries.MAXIMUM || size & (size - 1)) {
      size = this._creator.options.defaultImageSize;
    }

    return `${CDN_URL}${Endpoints.USER_AVATAR(this.id, this.avatar)}.${format}?size=${size}`;
  }
}

export default User;
