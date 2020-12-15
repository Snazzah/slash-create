import { CDN_URL, Endpoints, ImageFormat, ImageFormats, ImageSizeBoundaries, CommandMember } from '../constants';
import SlashCreator from '../creator';
import Permissions from './permissions';
import UserFlags from './userFlags';

class Member {
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

  private _creator: SlashCreator;

  private _permissionsBitfield?: Permissions;
  private _permissions: string;

  private _userFlagsBitfield?: UserFlags;
  private _userFlags: number;

  constructor(data: CommandMember, creator: SlashCreator) {
    this._creator = creator;

    this.nick = data.nick;
    this.joinedAt = Date.parse(data.joined_at);
    this.roles = data.roles;
    if (data.premium_since) this.premiumSince = Date.parse(data.premium_since);
    this.mute = data.mute;
    this.deaf = data.deaf;
    this._permissions = data.permissions;

    this.id = data.user.id;
    this.username = data.user.username;
    this.discriminator = data.user.discriminator;
    this.avatar = data.user.avatar;
    this._userFlags = data.user.public_flags;
  }

  /** The permissions the member has. */
  get permissions() {
    if (!this._permissionsBitfield) this._permissionsBitfield = new Permissions(parseInt(this._permissions));
    return this._permissionsBitfield;
  }

  /** The public flags for the user. */
  get userFlags() {
    if (!this._userFlagsBitfield) this._userFlagsBitfield = new Permissions(this._userFlags);
    return this._userFlagsBitfield;
  }

  get mention() {
    return `<@!${this.id}>`;
  }

  toString() {
    return `[Member ${this.id}]`;
  }

  get displayName() {
    return this.nick || this.username;
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

export default Member;
