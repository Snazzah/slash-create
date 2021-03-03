import Member from './structures/member';
import { RespondFunction } from './server';
import SlashCreator from './creator';
import { AnyCommandOption, InteractionRequestData } from './constants';
import { MessageAllowedMentions } from './util';
import Message from './structures/message';
import User from './structures/user';
import Collection from '@discordjs/collection';
import Channel from './structures/channel';
import Role from './structures/role';
import ResolvedMember from './structures/resolvedMember';
/** Command options converted for ease of use. */
export declare type ConvertedOption = {
    [key: string]: ConvertedOption;
} | string | number | boolean;
/** The options for {@link CommandContext#edit}. */
export interface EditMessageOptions {
    /** The message content. */
    content?: string;
    /** The embeds of the message. */
    embeds?: any[];
    /** The mentions allowed to be used in this message. */
    allowedMentions?: MessageAllowedMentions;
}
/** The options for {@link CommandContext#sendFollowUp}. */
interface FollowUpMessageOptions extends EditMessageOptions {
    /** Whether to use TTS for the content. */
    tts?: boolean;
    /** The flags to use in the message. */
    flags?: number;
}
/** The options for {@link CommandContext#send}. */
export interface MessageOptions extends FollowUpMessageOptions {
    /**
     * Whether or not the message should be ephemeral.
     * Ignored if `flags` is defined.
     */
    ephemeral?: boolean;
}
/** Context representing a command interaction. */
declare class CommandContext {
    /** The creator of the command. */
    readonly creator: SlashCreator;
    /** The full interaction data. */
    readonly data: InteractionRequestData;
    /** The interaction's token. */
    readonly interactionToken: string;
    /** The interaction's ID. */
    readonly interactionID: string;
    /** The channel ID that the command was invoked in. */
    readonly channelID: string;
    /** The guild ID that the command was invoked in. */
    readonly guildID?: string;
    /** The member that invoked the command. */
    readonly member?: Member;
    /** The user that invoked the command. */
    readonly user: User;
    /** The command's name. */
    readonly commandName: string;
    /** The command's ID. */
    readonly commandID: string;
    /** The options given to the command. */
    readonly options: {
        [key: string]: ConvertedOption;
    };
    /** The subcommands the member used in order. */
    readonly subcommands: string[];
    /** The time when the context was created. */
    readonly invokedAt: number;
    /** Whether the initial response was sent. */
    initiallyResponded: boolean;
    /** Whether there is a deferred message available. */
    deferred: boolean;
    /** The resolved users of the interaction. */
    readonly users: Collection<string, User>;
    /** The resolved members of the interaction. */
    readonly members: Collection<string, ResolvedMember>;
    /** The resolved roles of the interaction. */
    readonly roles: Collection<string, Role>;
    /** The resolved channels of the interaction. */
    readonly channels: Collection<string, Channel>;
    /** Whether the context is from a webserver. */
    private webserverMode;
    /** The initial response function. */
    private _respond;
    /** The timeout for the auto-response. */
    private _timeout?;
    /**
     * @param creator The instantiating creator.
     * @param data The interaction data for the context.
     * @param respond The response function for the interaction.
     * @param webserverMode Whether the interaction was from a webserver.
     * @param deferEphemeral Whether the context should auto-defer ephemeral messages.
     */
    constructor(creator: SlashCreator, data: InteractionRequestData, respond: RespondFunction, webserverMode: boolean, deferEphemeral?: boolean);
    /** Whether the interaction has expired. Interactions last 15 minutes. */
    get expired(): boolean;
    /**
     * Sends a message, if it already made an initial response, this will create a follow-up message.
     * IF the context has created a deferred message, it will edit that deferred message,
     * and future calls to this function create follow ups.
     * This will return a boolean if it's an initial response, otherwise a {@link Message} will be returned.
     * Note that when making a follow-up message, the `ephemeral` option is ignored.
     * @param content The content of the message
     * @param options The message options
     */
    send(content: string | MessageOptions, options?: MessageOptions): Promise<boolean | Message>;
    /**
     * Sends a follow-up message.
     * @param content The content of the message
     * @param options The message options
     */
    sendFollowUp(content: string | FollowUpMessageOptions, options?: FollowUpMessageOptions): Promise<Message>;
    /**
     * Edits a message.
     * @param messageID The message's ID
     * @param content The content of the message
     * @param options The message options
     */
    edit(messageID: string, content: string | EditMessageOptions, options?: EditMessageOptions): Promise<Message>;
    /**
     * Edits the original message.
     * This is put on a timeout of 150 ms for webservers to account for
     * Discord recieving and processing the original response.
     * Note: This will error with ephemeral messages or deferred ephemeral messages.
     * @param content The content of the message
     * @param options The message options
     */
    editOriginal(content: string | EditMessageOptions, options?: EditMessageOptions): Promise<Message>;
    /**
     * Deletes a message. If the message ID was not defined, the original message is used.
     * @param messageID The message's ID
     */
    delete(messageID?: string): Promise<any>;
    /**
     * Creates a deferred message. To users, this will show as
     * "Bot is thinking..." until the deferred message is edited.
     * @param ephemeral Whether to make the deferred message ephemeral.
     * @returns Whether the deferred message passed
     */
    defer(ephemeral?: boolean): Promise<boolean>;
    /** @private */
    static convertOptions(options: AnyCommandOption[]): {
        [key: string]: ConvertedOption;
    };
    /** @private */
    static getSubcommandArray(options: AnyCommandOption[]): string[];
}
export default CommandContext;
