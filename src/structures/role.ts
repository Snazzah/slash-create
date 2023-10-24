import {
  CDN_URL,
  Endpoints,
  ImageFormat,
  ImageFormats,
  ImageSizeBoundaries,
  ResolvedRole,
  RoleTags
} from '../constants';
import { BaseSlashCreator } from '../creator';
import { Permissions } from './permissions';

/** Represents a resolved role object. */
export class Role {
  /** The role's ID */
  readonly id: string;
  /** The role's name */
  readonly name: string;
  /** The role's position */
  readonly position: number;
  /** The role's color integer */
  readonly color: number;
  /** Whether the role is being hoisted */
  readonly hoist: boolean;
  /** The role icon hash */
  readonly icon?: string;
  /** Whether the role is being managed by an application */
  readonly managed: boolean;
  /** Whether the role is mentionable by everyone */
  readonly mentionable: boolean;
  /** The role unicode emoji */
  readonly unicodeEmoji?: string;
  /** The role's tags */
  readonly tags?: RoleTags;

  /** The creator of the role class. */
  private _creator: BaseSlashCreator;

  private _permissionsBitfield?: Permissions;
  private _permissions: string;

  /**
   * @param data The data for the member
   */
  constructor(data: ResolvedRole, creator: BaseSlashCreator) {
    this._creator = creator;

    this.id = data.id;
    this.name = data.name;
    this.position = data.position;
    this.color = data.color;
    this.hoist = data.hoist;
    if (data.icon) this.icon = data.icon;
    this.managed = data.managed;
    this.mentionable = data.mentionable;
    if (data.unicode_emoji) this.unicodeEmoji = data.unicode_emoji;
    this._permissions = data.permissions;
    if (data.tags) this.tags = data.tags;
  }

  /** The URL of the role icon. */
  get iconURL() {
    return this.dynamicIconURL();
  }

  /**
   * Get the role's icon with the given format and size.
   * @param format The format of the icon
   * @param size The size of the icon
   */
  dynamicIconURL(format?: ImageFormat, size?: number) {
    if (!this.icon) return null;
    if (!format || !ImageFormats.includes(format.toLowerCase())) {
      format = this._creator.options.defaultImageFormat;
    }

    if (!size || size < ImageSizeBoundaries.MINIMUM || size > ImageSizeBoundaries.MAXIMUM) {
      size = this._creator.options.defaultImageSize;
    }

    return `${CDN_URL}${Endpoints.ROLE_ICON(this.id, this.icon)}.${format}?size=${size}`;
  }

  /** The string that mentions this role. */
  get mention() {
    return `<@&${this.id}>`;
  }

  /** The role's color in hexadecimal, with a leading hashtag */
  get colorHex() {
    return `#${this.color.toString(16).padStart(6, '0')}`;
  }

  /** The permissions the member has. */
  get permissions() {
    if (!this._permissionsBitfield) this._permissionsBitfield = new Permissions(BigInt(this._permissions));
    return this._permissionsBitfield;
  }

  /** @hidden */
  toString() {
    return `[Role ${this.id}]`;
  }
}
