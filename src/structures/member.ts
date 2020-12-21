/* global BigInt */
import { CommandMember } from '../constants';
import SlashCreator from '../creator';
import Permissions from './permissions';
import User from './user';

class Member {
  /** The member's ID */
  id: string;
  /** The member's nickname */
  nick?: string;
  /** The timestamp the member joined the guild */
  joinedAt: number;
  /** An array of role IDs that the user has. */
  roles: string[];
  /** The time of when this member boosted the server. */
  premiumSince?: number;
  /** Whether the user is muted in voice channels */
  mute: boolean;
  /** Whether the user is deafened in voice channels */
  deaf: boolean;
  /** The user object for this member */
  user: User;

  /** The creator of the member class. */
  private _creator: SlashCreator;

  private _permissionsBitfield?: Permissions;
  private _permissions: string;

  /**
   * @param data The data for the member
   * @param creator The instantiating creator
   */
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
    this.user = new User(data.user, creator);
  }

  /** The permissions the member has. */
  get permissions() {
    if (!this._permissionsBitfield) this._permissionsBitfield = new Permissions(BigInt(this._permissions));
    return this._permissionsBitfield;
  }

  /** The string that mentions this member. */
  get mention() {
    return `<@!${this.id}>`;
  }

  /** @private */
  toString() {
    return `[Member ${this.id}]`;
  }

  /** The display name for this member. */
  get displayName() {
    return this.nick || this.user.username;
  }
}

export default Member;
