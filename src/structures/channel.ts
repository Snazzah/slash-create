/* global BigInt */
import { ResolvedChannel } from '../constants';
import Permissions from './permissions';

/** Represents a resolved channel object. */
class Channel {
  /** The channel's ID */
  readonly id: string;
  /** The channel's name */
  readonly name: string;
  /** The channel's type */
  readonly type: number;

  private _permissionsBitfield?: Permissions;
  private _permissions: string;

  /**
   * @param data The data for the member
   * @param userData The data for the member's user
   * @param creator The instantiating creator
   */
  constructor(data: ResolvedChannel) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this._permissions = data.permissions;
  }

  /** The string that mentions this channel. */
  get mention() {
    return `<@#${this.id}>`;
  }

  /** The permissions the member has. */
  get permissions() {
    if (!this._permissionsBitfield) this._permissionsBitfield = new Permissions(BigInt(this._permissions));
    return this._permissionsBitfield;
  }

  /** @hidden */
  toString() {
    return `[Channel ${this.id}]`;
  }
}

export default Channel;
