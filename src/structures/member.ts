import { CommandMember } from '../constants';
import { BaseSlashCreator } from '../creator';
import { Permissions } from './permissions';
import { ResolvedMember } from './resolvedMember';

/** Represents a Discord guild member. */
export class Member extends ResolvedMember {
  /** Whether the user is muted in voice channels */
  readonly mute: boolean;
  /** Whether the user is deafened in voice channels */
  readonly deaf: boolean;

  private _permissionsBitfield?: Permissions;
  private _permissions: string;

  /**
   * @param data The data for the member
   * @param creator The instantiating creator
   */
  constructor(data: CommandMember, creator: BaseSlashCreator, guildID: string) {
    super(data, data.user, creator, guildID);
    this.mute = data.mute;
    this.deaf = data.deaf;
    this._permissions = data.permissions;
  }

  /** The permissions the member has. */
  get permissions() {
    if (!this._permissionsBitfield) this._permissionsBitfield = new Permissions(BigInt(this._permissions));
    return this._permissionsBitfield;
  }

  /** @hidden */
  toString() {
    return `[Member ${this.id}]`;
  }
}
