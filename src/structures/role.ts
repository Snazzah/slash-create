/* global BigInt */
import { ResolvedRole } from '../constants';
import Permissions from './permissions';

/** Represents a resolved role object. */
class Role {
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
  /** Whether the role is being managed by an application */
  readonly managed: boolean;
  /** Whether the role is mentionable by everyone */
  readonly mentionable: boolean;

  private _permissionsBitfield?: Permissions;
  private _permissions: string;

  /**
   * @param data The data for the member
   */
  constructor(data: ResolvedRole) {
    this.id = data.id;
    this.name = data.name;
    this.position = data.position;
    this.color = data.color;
    this.hoist = data.hoist;
    this.managed = data.managed;
    this.mentionable = data.mentionable;
    this._permissions = data.permissions;
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

export default Role;
