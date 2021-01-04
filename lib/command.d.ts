import { ApplicationCommandOption, PartialApplicationCommand } from './constants';
import CommandContext, { MessageOptions } from './context';
import SlashCreator from './creator';
/** The options for a {@link SlashCommand}. */
export interface SlashCommandOptions {
    /** The name of the command. */
    name: string;
    /** The description of the command. */
    description: string;
    /** The guild ID that this command will be assigned to. */
    guildID?: string;
    /** The required permission(s) for this command. */
    requiredPermissions?: Array<string>;
    /** The command's options. */
    options?: ApplicationCommandOption[];
    /** The throttling options for the command. */
    throttling?: ThrottlingOptions;
    /** Whether this command is used for unknown commands. */
    unknown?: boolean;
}
/** The throttling options for a {@link SlashCommand}. */
export interface ThrottlingOptions {
    /** Maximum number of usages of the command allowed in the time frame. */
    usages: number;
    /** Amount of time to count the usages of the command within (in seconds). */
    duration: number;
}
/** @private */
export interface ThrottleObject {
    start: number;
    usages: number;
    timeout: any;
}
/** Represents a Discord slash command. */
declare class SlashCommand {
    /** The command's name. */
    readonly commandName: string;
    /** The command's description. */
    readonly description: string;
    /** The options for the command. */
    readonly options?: ApplicationCommandOption[];
    /** The guild ID for the command. */
    readonly guildID?: string;
    /** The permissions required to use this command. */
    readonly requiredPermissions?: Array<string>;
    /** The throttling options for this command. */
    readonly throttling?: ThrottlingOptions;
    /** Whether this command is used for unknown commands. */
    readonly unknown: boolean;
    /**
     * The file path of the command.
     * Used for refreshing the require cache.
     * Set this to `__filename` in the constructor to enable cache clearing.
     */
    filePath?: string;
    /** The creator responsible for this command. */
    readonly creator: SlashCreator;
    /** Current throttle objects for the command, mapped by user ID. */
    private _throttles;
    /**
     * @param creator The instantiating creator.
     * @param opts The options for the command.
     */
    constructor(creator: SlashCreator, opts: SlashCommandOptions);
    /**
     * The JSON for using commands in Discord's API.
     * @private
     */
    get commandJSON(): PartialApplicationCommand;
    /**
     * The internal key name for the command.
     * @private
     */
    get keyName(): string;
    /**
     * Checks whether the context member has permission to use the command.
     * @param ctx The triggering context
     * @return {boolean|string} Whether the member has permission, or an error message to respond with if they don't
     */
    hasPermission(ctx: CommandContext): boolean | string;
    /**
     * Called when the command is prevented from running.
     * @param ctx Command context the command is running from
     * @param reason Reason that the command was blocked
     * (built-in reasons are `permission`, `throttling`)
     * @param data Additional data associated with the block.
     * - permission: `response` ({@link string}) to send
     * - throttling: `throttle` ({@link Object}), `remaining` ({@link number}) time in seconds
     */
    onBlock(ctx: CommandContext, reason: string, data?: any): Promise<boolean | import("./structures/message").default> | null;
    /**
     * Called when the command produces an error while running.
     * @param err Error that was thrown
     * @param ctx Command context the command is running from
     */
    onError(err: Error, ctx: CommandContext): Promise<boolean | import("./structures/message").default> | undefined;
    /**
     * Creates/obtains the throttle object for a user, if necessary.
     * @param userID ID of the user to throttle for
     * @private
     */
    throttle(userID: string): ThrottleObject | null;
    /** Reloads the command. */
    reload(): void;
    /** Unloads the command. */
    unload(): void;
    /**
     * Runs the command.
     * @param ctx The context of the interaction
     */
    run(ctx: CommandContext): Promise<string | MessageOptions | void>;
    /**
     * Finalizes the return output
     * @param response The response from the command
     * @param ctx The context of the interaction
     * @private
     */
    finalize(response: any, ctx: CommandContext): Promise<boolean | import("./structures/message").default> | undefined;
    /**
     * Validates {@link SlashCommandOptions}.
     * @private
     */
    static validateOptions(opts: SlashCommandOptions): void;
}
export default SlashCommand;
