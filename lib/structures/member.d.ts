import { CommandMember } from '../constants';
import SlashCreator from '../creator';
import Permissions from './permissions';
import ResolvedMember from './resolvedMember';
/** Represents a Discord guild member. */
declare class Member extends ResolvedMember {
    /** Whether the user is muted in voice channels */
    readonly mute: boolean;
    /** Whether the user is deafened in voice channels */
    readonly deaf: boolean;
    private _permissionsBitfield?;
    private _permissions;
    /**
     * @param data The data for the member
     * @param creator The instantiating creator
     */
    constructor(data: CommandMember, creator: SlashCreator);
    /** The permissions the member has. */
    get permissions(): Permissions;
    /** @hidden */
    toString(): string;
}
export default Member;
