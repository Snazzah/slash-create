import { UserObject } from '../constants';
import CommandContext, { EditMessageOptions } from '../context';
import User from './user';
/** @hidden */
export interface MessageData {
    id: string;
    type: number;
    content: string;
    channel_id: string;
    author: UserObject;
    attachments: any[];
    embeds: any[];
    mentions: string[];
    mention_roles: string[];
    pinned: boolean;
    mention_everyone: boolean;
    tts: boolean;
    timestamp: string;
    edited_timestamp: string | null;
    flags: number;
    webhook_id: string;
}
/** Represents a Discord message. */
declare class Message {
    /** The message's ID */
    readonly id: string;
    /** The message type */
    readonly type: number;
    /** The content of the message */
    readonly content: string;
    /** The ID of the channel the message is in */
    readonly channelID: string;
    /** The author of the message */
    readonly author: User;
    /** The message's attachments */
    readonly attachments: any[];
    /** The message's embeds */
    readonly embeds: any[];
    /** The message's user mentions */
    readonly mentions: string[];
    /** The message's role mentions */
    readonly roleMentions: string[];
    /** Whether the message mentioned everyone/here */
    readonly mentionedEveryone: boolean;
    /** Whether the message used TTS */
    readonly tts: boolean;
    /** The timestamp of the message */
    readonly timestamp: number;
    /** The timestamp of when the message was last edited */
    readonly editedTimestamp?: number;
    /** The message's flags */
    readonly flags: number;
    /** The message's webhook ID */
    readonly webhookID: string;
    /** The context that created the message class */
    private readonly _ctx;
    /**
     * @param data The data for the message
     * @param ctx The instantiating context
     */
    constructor(data: MessageData, ctx: CommandContext);
    /**
     * Edits this message.
     * @param content The content of the message
     * @param options The message options
     */
    edit(content: string | EditMessageOptions, options?: EditMessageOptions): Promise<Message>;
    /** Deletes this message. */
    delete(): Promise<any>;
}
export default Message;
