"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("./user"));
class Message {
    constructor(data, ctx) {
        this._ctx = ctx;
        this.id = data.id;
        this.type = data.type;
        this.content = data.content || '';
        this.channelID = data.channel_id;
        this.author = new user_1.default(data.author, ctx.creator);
        this.attachments = data.attachments;
        this.embeds = data.embeds;
        this.mentions = data.mentions;
        this.roleMentions = data.mention_roles;
        this.mentionedEveryone = data.mention_everyone;
        this.tts = data.tts;
        this.timestamp = Date.parse(data.timestamp);
        if (data.edited_timestamp)
            this.editedTimestamp = Date.parse(data.edited_timestamp);
        this.flags = data.flags;
        this.webhookID = data.webhook_id;
    }
    /**
     * Edits this message.
     * @param content The content of the message
     * @param options The message options
     */
    edit(content, options) {
        return this._ctx.edit(this.id, content, options);
    }
    /**
     * Deletes this message.
     */
    delete() {
        return this._ctx.delete(this.id);
    }
}
exports.default = Message;
