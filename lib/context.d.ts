import Member from './structures/member';
import { Response } from './server';
import SlashCreator from './creator';
import { CommandOption, InteractionRequestData } from './constants';
import { MessageAllowedMentions } from './util';
declare type ConvertedOption = {
    [key: string]: ConvertedOption;
} | string | number | boolean;
interface MessageOptions {
    tts?: boolean;
    content?: string;
    embeds?: any[];
    allowedMentions?: MessageAllowedMentions;
    flags?: number;
    /**
     * Whether or not the message should be ephemeral.
     * Ignored if `flags` is defined.
     */
    ephemeral?: boolean;
    /** Whether or not to include the source of the interaction in the message. */
    includeSource?: boolean;
}
declare class CommandContext {
    readonly creator: SlashCreator;
    readonly data: InteractionRequestData;
    readonly interactionToken: string;
    readonly interactionID: string;
    readonly channelID: string;
    readonly guildID: string;
    readonly member: Member;
    readonly commandName: string;
    readonly commandID: string;
    readonly options?: {
        [key: string]: ConvertedOption;
    };
    readonly invokedAt: number;
    initiallyResponded: boolean;
    initialResponseDeleted: boolean;
    private _respond;
    constructor(creator: SlashCreator, data: InteractionRequestData, respond: (response: Response) => void);
    /**
     * Sends a message, if it already made an initial response, this will create a follow-up message.
     * Note that when making a follow-up message, the `ephemeral` and `includeSource` are ignored.
     * @param content The content of the message
     * @param options The message options
     */
    send(content: string | MessageOptions, options?: MessageOptions): Promise<boolean | any>;
    /**
     * Deletes a message. If the message ID was not defined, the original message is used.
     * @param content The content of the message
     * @param options The message options
     */
    delete(messageID?: string): Promise<any>;
    /**
     * Acknowleges the interaction. Including source will send a message showing only the source.
     * @param includeSource Whether to include the source in the acknolegement.
     * @returns Whether the acknowledgement passed
     */
    acknowledge(includeSource?: boolean): boolean;
    /** @private */
    static convertOptions(options: CommandOption[]): {
        [key: string]: ConvertedOption;
    };
}
export default CommandContext;
