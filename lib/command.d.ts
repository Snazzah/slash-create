import { ApplicationCommandOption, PartialApplicationCommand } from './constants';
import CommandContext from './context';
import SlashCreator from './creator';
interface SlashCommandOptions {
    /** The name of the command. */
    name: string;
    /** The description of the command. */
    description: string;
    /** The guild ID that this command will be assigned to. */
    guildID?: string;
    /** The required permission(s) for this command. */
    requiredPermissions?: Array<string>;
    /** The command options */
    options?: ApplicationCommandOption[];
    throttling?: ThrottlingOptions;
}
interface ThrottlingOptions {
    /** Maximum number of usages of the command allowed in the time frame. */
    usages: number;
    /** Amount of time to count the usages of the command within (in seconds). */
    duration: number;
}
interface ThrottleObject {
    start: number;
    usages: number;
    timeout: any;
}
declare class SlashCommand {
    commandName: string;
    description: string;
    options?: ApplicationCommandOption[];
    guildID?: string;
    requiredPermissions?: Array<string>;
    throttling?: ThrottlingOptions;
    readonly creator: SlashCreator;
    /** Current throttle objects for the command, mapped by user ID */
    private _throttles;
    constructor(creator: SlashCreator, opts: SlashCommandOptions);
    get commandJSON(): PartialApplicationCommand;
    /** @private */
    get keyName(): string;
    /**
     * Checks whether the context member has permission to use the command
     * @param ctx The triggering context
     * @return {boolean|string} Whether the member has permission, or an error message to respond with if they don't
     */
    hasPermission(ctx: CommandContext): boolean | string;
    /**
     * Called when the command is prevented from running, The only reason is `permission` for now.
     * @param ctx Command context the command is running from
     * @param reason Reason that the command was blocked
     * (built-in reasons are `permission`, `throttling`)
     * @param data Additional data associated with the block.
     * - permission: `response` ({@link string}) to send
     * - throttling: `throttle` ({@link Object}), `remaining` ({@link number}) time in seconds
     */
    onBlock(ctx: CommandContext, reason: string, data?: any): Promise<any> | null;
    /**
     * Called when the command produces an error while running
     * @param err Error that was thrown
     * @param ctx Command context the command is running from
     */
    onError(err: Error, ctx: CommandContext): Promise<any>;
    /**
     * Creates/obtains the throttle object for a user, if necessary
     * @param userID ID of the user to throttle for
     * @private
     */
    throttle(userID: string): ThrottleObject | null;
    /**
     * Runs the command
     * @param ctx The context of the interaction
     */
    run(ctx: CommandContext): Promise<any>;
    /**
     * Finalizes the return output
     * @param response The response from the command
     * @param ctx The context of the interaction
     * @private
     */
    finalize(response: any, ctx: CommandContext): boolean | Promise<any> | undefined;
    static validateOptions(opts: SlashCommandOptions): void;
}
export default SlashCommand;
