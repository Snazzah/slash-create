import {
  CommandUser,
  ResolvedMemberData,
  CDN_URL,
  Endpoints,
  ImageFormat,
  ImageFormats,
  ImageSizeBoundaries
} from '../constants';
import { SlashCreator } from '../creator';
import { User } from './user';

/** Represents a resolved member object. */
export class ResolvedMember {
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
  /** The timestamp when the member's timeout will expire */
  readonly communicationDisabledUntil?: number;
  /** The guild member flags represented as a bit set */
  readonly flags?: number;
  /** Whether the member is pending verification */
  readonly pending: boolean;
  /** The member's guild avatar hash */
  readonly avatar?: string;
  /** The user object for this member */
  readonly user: User;
  /** The ID of the guild this member belongs to. */
  readonly guildID: string;

  /** The creator of the member class. */
  private readonly _creator: SlashCreator;

  /**
   * @param data The data for the member
   * @param userData The data for the member's user
   * @param creator The instantiating creator
   * @param guildID The ID of the guild this member belongs to
   */
  constructor(data: ResolvedMemberData, userData: CommandUser, creator: SlashCreator, guildID: string) {
    this._creator = creator;

    if (data.nick) this.nick = data.nick;
    this.joinedAt = Date.parse(data.joined_at);
    this.roles = data.roles;
    if (data.premium_since) this.premiumSince = Date.parse(data.premium_since);
    if (data.communication_disabled_until)
      this.communicationDisabledUntil = Date.parse(data.communication_disabled_until);
    this.flags = data.flags;
    this.pending = data.pending;
    this.guildID = guildID;

    this.id = userData.id;
    if (data.avatar) this.avatar = data.avatar;
    this.user = new User(userData, creator);
  }

  /** The string that mentions this member. */
  get mention() {
    return `<@!${this.id}>`;
  }

  /** @hidden */
  toString() {
    return `[ResolvedMember ${this.id}]`;
  }

  /** The display name for this member. */
  get displayName() {
    return this.nick || this.user.username;
  }

  /** The URL to the member's avatar. */
  get avatarURL() {
    return this.dynamicAvatarURL();
  }

  /**
   * Get the user's avatar with the given format and size.
   * @param format The format of the avatar
   * @param size The size of the avatar
   */
  dynamicAvatarURL(format?: ImageFormat, size?: number) {
    if (!this.avatar) return this.user.dynamicAvatarURL(format, size);
    if (!format || !ImageFormats.includes(format.toLowerCase()))
      format = this.avatar.startsWith('a_') ? 'gif' : this._creator.options.defaultImageFormat;
    if (!size || size < ImageSizeBoundaries.MINIMUM || size > ImageSizeBoundaries.MAXIMUM)
      size = this._creator.options.defaultImageSize;

    return `${CDN_URL}${Endpoints.GUILD_MEMBER_AVATAR(this.guildID, this.id, this.avatar)}.${format}?size=${size}`;
  }
}
