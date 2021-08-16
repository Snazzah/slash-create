import { CommandUser, ResolvedMemberData } from '../constants';
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
  /** Whether the member is pending verification */
  readonly pending: boolean;
  /** The user object for this member */
  readonly user: User;

  /** The creator of the member class. */
  private readonly _creator: SlashCreator;

  /**
   * @param data The data for the member
   * @param userData The data for the member's user
   * @param creator The instantiating creator
   */
  constructor(data: ResolvedMemberData, userData: CommandUser, creator: SlashCreator) {
    this._creator = creator;

    if (data.nick) this.nick = data.nick;
    this.joinedAt = Date.parse(data.joined_at);
    this.roles = data.roles;
    if (data.premium_since) this.premiumSince = Date.parse(data.premium_since);
    this.pending = data.pending;

    this.id = userData.id;
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
}
