import { UserObject } from '../constants';
import CommandContext, { EditMessageOptions } from '../context';
import User from './user';
/** @private */
interface MessageData {
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
    edited_timestamp?: string;
    flags: number;
    webhook_id: string;
}
/** Represents a Discord message. */
declare class Message {
    /** The message's ID */
    id: string;
    /** The message type */
    type: number;
    /** The content of the message */
    content: string;
    /** The ID of the channel the message is in. */
    channelID: string;
    /** The author of the message. */
    author: User;
    /** The message's attachments. */
    attachments: any[];
    /** The message's embeds. */
    embeds: any[];
    /** The message's user mentions */
    mentions: string[];
    /** The message's role mentions */
    roleMentions: string[];
    /** Whether the message mentioned everyone/here */
    mentionedEveryone: boolean;
    /** Whether the message used TTS */
    tts: boolean;
    /** The timestamp of the message */
    timestamp: number;
    /** The timestamp of when the message was last edited */
    editedTimestamp?: number;
    /** The message's flags */
    flags: number;
    /** The message's webhook ID */
    webhookID: string;
    /** The context that created the message class. */
    private _ctx;
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
