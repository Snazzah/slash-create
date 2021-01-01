"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const member_1 = __importDefault(require("./structures/member"));
const constants_1 = require("./constants");
const util_1 = require("./util");
const message_1 = __importDefault(require("./structures/message"));
/** Context representing a command interaction. */
class CommandContext {
    /**
     * @param creator The instantiating creator.
     * @param data The interaction data for the context.
     * @param respond The response function for the interaction.
     * @param webserverMode Whether the interaction was from a webserver.
     */
    constructor(creator, data, respond, webserverMode) {
        /** The time when the context was created. */
        this.invokedAt = Date.now();
        /** Whether the initial response was made. */
        this.initiallyResponded = false;
        this.creator = creator;
        this.data = data;
        this.webserverMode = webserverMode;
        this._respond = respond;
        this.interactionToken = data.token;
        this.interactionID = data.id;
        this.channelID = data.channel_id;
        this.guildID = data.guild_id;
        this.member = new member_1.default(data.member, this.creator);
        this.commandName = data.data.name;
        this.commandID = data.data.id;
        this.options = data.data.options ? CommandContext.convertOptions(data.data.options) : {};
        this.subcommands = data.data.options ? CommandContext.getSubcommandArray(data.data.options) : [];
        // Auto-acknowledge if no response was given in 2.5 seconds
        this._timeout = setTimeout(() => this.acknowledge(creator.options.autoAcknowledgeSource || false), 2500);
    }
    /** Whether the interaction has expired. Interactions last 15 minutes. */
    get expired() {
        return this.invokedAt + 1000 * 60 * 15 < Date.now();
    }
    /**
     * Sends a message, if it already made an initial response, this will create a follow-up message.
     * This will return a boolean if it's an initial response, otherwise a {@link Message} will be returned.
     * Note that when making a follow-up message, the `ephemeral` and `includeSource` are ignored.
     * @param content The content of the message
     * @param options The message options
     */
    async send(content, options) {
        if (this.expired)
            throw new Error('This interaction has expired');
        if (typeof content !== 'string')
            options = content;
        else if (typeof options !== 'object')
            options = {};
        if (typeof options !== 'object')
            throw new Error('Message options is not an object.');
        if (!options.content && typeof content === 'string')
            options.content = content;
        if (!options.content && !options.embeds)
            throw new Error('Message content and embeds are both not given.');
        if (options.ephemeral && !options.flags)
            options.flags = constants_1.InteractionResponseFlags.EPHEMERAL;
        const allowedMentions = options.allowedMentions
            ? util_1.formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions)
            : this.creator.allowedMentions;
        if (!this.initiallyResponded) {
            this.initiallyResponded = true;
            clearTimeout(this._timeout);
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
            return true;
        }
        else
            return this.sendFollowUp(content, options);
    }
    /**
     * Sends a follow-up message.
     * @param content The content of the message
     * @param options The message options
     */
    async sendFollowUp(content, options) {
        if (this.expired)
            throw new Error('This interaction has expired');
        if (typeof content !== 'string')
            options = content;
        else if (typeof options !== 'object')
            options = {};
        if (typeof options !== 'object')
            throw new Error('Message options is not an object.');
        if (!options.content && typeof content === 'string')
            options.content = content;
        if (!options.content && !options.embeds)
            throw new Error('Message content and embeds are both not given.');
        const allowedMentions = options.allowedMentions
            ? util_1.formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions)
            : this.creator.allowedMentions;
        const data = await this.creator.requestHandler.request('POST', constants_1.Endpoints.FOLLOWUP_MESSAGE(this.creator.options.applicationID, this.interactionToken), true, {
            tts: options.tts,
            content: options.content,
            embeds: options.embeds,
            allowed_mentions: allowedMentions
        });
        return new message_1.default(data, this);
    }
    /**
     * Edits a message.
     * @param messageID The message's ID
     * @param content The content of the message
     * @param options The message options
     */
    async edit(messageID, content, options) {
        if (this.expired)
            throw new Error('This interaction has expired');
        if (typeof content !== 'string')
            options = content;
        else if (typeof options !== 'object')
            options = {};
        if (typeof options !== 'object')
            throw new Error('Message options is not an object.');
        if (!options.content && typeof content === 'string')
            options.content = content;
        if (!options.content && !options.embeds && !options.allowedMentions)
            throw new Error('No valid options were given.');
        const allowedMentions = options.allowedMentions
            ? util_1.formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions)
            : this.creator.allowedMentions;
        const data = await this.creator.requestHandler.request('PATCH', constants_1.Endpoints.MESSAGE(this.creator.options.applicationID, this.interactionToken, messageID), true, {
            content: options.content,
            embeds: options.embeds,
            allowed_mentions: allowedMentions
        });
        return new message_1.default(data, this);
    }
    /**
     * Edits the original message.
     * This is put on a timeout of 150 ms for webservers to account for
     * Discord recieving and processing the original response.
     * Note: This will error with ephemeral messages or acknowledgements.
     * @param content The content of the message
     * @param options The message options
     */
    editOriginal(content, options) {
        if (!this.webserverMode)
            return this.edit('@original', content, options);
        return new Promise((resolve, reject) => setTimeout(() => this.edit('@original', content, options).then(resolve).catch(reject), 150));
    }
    /**
     * Deletes a message. If the message ID was not defined, the original message is used.
     * @param messageID The message's ID
     */
    async delete(messageID) {
        if (this.expired)
            throw new Error('This interaction has expired');
        return this.creator.requestHandler.request('DELETE', constants_1.Endpoints.MESSAGE(this.creator.options.applicationID, this.interactionToken, messageID));
    }
    /**
     * Acknowleges the interaction. Including source will send a message showing only the source.
     * @param includeSource Whether to include the source in the acknowledgement.
     * @returns Whether the acknowledgement passed
     */
    async acknowledge(includeSource = false) {
        if (!this.initiallyResponded) {
            this.initiallyResponded = true;
            clearTimeout(this._timeout);
            await this._respond({
                status: 200,
                body: {
                    type: includeSource ? constants_1.InterationResponseType.ACKNOWLEDGE_WITH_SOURCE : constants_1.InterationResponseType.ACKNOWLEDGE
                }
            });
            return true;
        }
        return false;
    }
    /** @private */
    static convertOptions(options) {
        const convertedOptions = {};
        for (const option of options) {
            if ('options' in option)
                convertedOptions[option.name] = CommandContext.convertOptions(option.options);
            else
                convertedOptions[option.name] = option.value !== undefined ? option.value : {};
        }
        return convertedOptions;
    }
    /** @private */
    static getSubcommandArray(options) {
        const result = [];
        for (const option of options) {
            if ('options' in option)
                result.push(option.name, ...CommandContext.getSubcommandArray(option.options));
            else if (option.value === undefined && option.name)
                result.push(option.name);
        }
        return result;
    }
}
exports.default = CommandContext;
