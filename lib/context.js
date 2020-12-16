"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const member_1 = __importDefault(require("./structures/member"));
const constants_1 = require("./constants");
const util_1 = require("./util");
class CommandContext {
    constructor(creator, data, respond) {
        this.invokedAt = Date.now();
        this.initiallyResponded = false;
        this.initialResponseDeleted = false;
        this.creator = creator;
        this.data = data;
        this._respond = respond;
        this.interactionToken = data.token;
        this.interactionID = data.id;
        this.channelID = data.channel_id;
        this.guildID = data.guild_id;
        this.member = new member_1.default(data.member, this.creator);
        this.commandName = data.data.name;
        this.commandID = data.data.id;
        if (data.data.options)
            this.options = CommandContext.convertOptions(data.data.options);
    }
    // https://get.snaz.in/AFLrDBa.png
    /**
     * Sends a message, if it already made an initial response, this will create a follow-up message.
     * Note that when making a follow-up message, the `ephemeral` and `includeSource` are ignored.
     * @param content The content of the message
     * @param options The message options
     */
    async send(content, options) {
        if (typeof content !== 'string')
            options = content;
        else if (typeof options !== 'object')
            options = {};
        if (typeof options !== 'object')
            throw new Error('Message options is not an object.');
        if (!options.content)
            options.content = content;
        if (!options.content && !options.embeds)
            throw new Error('Message content and embeds are both not given.');
        if (options.ephemeral && !options.flags)
            options.flags = constants_1.InteractionResponseFlags.EPHEMERAL;
        const allowedMentions = options.allowedMentions
            ? util_1.formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions)
            : this.creator.allowedMentions;
        if (!this.initiallyResponded) {
            await this._respond({
                status: 200,
                body: {
                    type: options.includeSource
                        ? constants_1.InterationResponseType.CHANNEL_MESSAGE_WITH_SOURCE
                        : constants_1.InterationResponseType.CHANNEL_MESSAGE,
                    data: {
                        tts: options.tts,
                        content: options.content,
                        embeds: options.embeds,
                        flags: options.flags,
                        allowed_mentions: allowedMentions
                    }
                }
            });
            this.initiallyResponded = true;
            return true;
        }
        else
            return this.creator.requestHandler.request('POST', constants_1.Endpoints.FOLLOWUP_MESSAGE(this.creator.options.applicationID, this.interactionToken), true, {
                tts: options.tts,
                content: options.content,
                embeds: options.embeds,
                allowed_mentions: allowedMentions
            });
    }
    /**
     * Deletes a message. If the message ID was not defined, the original message is used.
     * @param content The content of the message
     * @param options The message options
     */
    delete(messageID) {
        return this.creator.requestHandler.request('DELETE', constants_1.Endpoints.MESSAGE(this.creator.options.applicationID, this.interactionToken, messageID));
    }
    /**
     * Acknowleges the interaction. Including source will send a message showing only the source.
     * @param includeSource Whether to include the source in the acknolegement.
     * @returns Whether the acknowledgement passed
     */
    async acknowledge(includeSource = false) {
        if (!this.initiallyResponded) {
            await this._respond({
                status: 200,
                body: {
                    type: includeSource ? constants_1.InterationResponseType.ACKNOWLEDGE_WITH_SOURCE : constants_1.InterationResponseType.ACKNOWLEDGE
                }
            });
            this.initiallyResponded = true;
            return true;
        }
        return false;
    }
    /** @private */
    static convertOptions(options) {
        const convertedOptions = {};
        for (const option of options) {
            if (option.options)
                convertedOptions[option.name] = CommandContext.convertOptions(option.options);
            else if (option.value)
                convertedOptions[option.name] = option.value;
        }
        return convertedOptions;
    }
}
exports.default = CommandContext;
