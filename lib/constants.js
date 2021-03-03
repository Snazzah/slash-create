"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Endpoints = exports.PermissionNames = exports.ImageSizeBoundaries = exports.ImageFormats = exports.CommandOptionType = exports.InteractionResponseFlags = exports.InterationResponseType = exports.InteractionType = exports.CDN_URL = exports.API_BASE_URL = exports.INTERACTION_VERSION = exports.API_VERSION = void 0;
exports.API_VERSION = 8;
exports.INTERACTION_VERSION = 1;
exports.API_BASE_URL = `/api/v${exports.API_VERSION}`;
exports.CDN_URL = 'https://cdn.discordapp.com';
/** The types of interactions. */
var InteractionType;
(function (InteractionType) {
    /** A ping. */
    InteractionType[InteractionType["PING"] = 1] = "PING";
    /** A command invocation. */
    InteractionType[InteractionType["COMMAND"] = 2] = "COMMAND";
})(InteractionType = exports.InteractionType || (exports.InteractionType = {}));
/** The types of interaction responses. */
var InterationResponseType;
(function (InterationResponseType) {
    /** Acknowledge a `PING`. */
    InterationResponseType[InterationResponseType["PONG"] = 1] = "PONG";
    // ACKNOWLEDGE = 2,
    // CHANNEL_MESSAGE = 3,
    /** Respond with a message, showing the user's input. */
    InterationResponseType[InterationResponseType["CHANNEL_MESSAGE_WITH_SOURCE"] = 4] = "CHANNEL_MESSAGE_WITH_SOURCE";
    /** Create a deferred message with source. */
    InterationResponseType[InterationResponseType["DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE"] = 5] = "DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE";
})(InterationResponseType = exports.InterationResponseType || (exports.InterationResponseType = {}));
/** Message flags for interaction responses. */
var InteractionResponseFlags;
(function (InteractionResponseFlags) {
    /** Sends a message back to the invoker, similar to messages by Clyde. */
    InteractionResponseFlags[InteractionResponseFlags["EPHEMERAL"] = 64] = "EPHEMERAL";
})(InteractionResponseFlags = exports.InteractionResponseFlags || (exports.InteractionResponseFlags = {}));
/**
 * An object mapping the types a command option can use.
 */
var CommandOptionType;
(function (CommandOptionType) {
    /** A sub-command for the application's command */
    CommandOptionType[CommandOptionType["SUB_COMMAND"] = 1] = "SUB_COMMAND";
    /** A group of sub-commands */
    CommandOptionType[CommandOptionType["SUB_COMMAND_GROUP"] = 2] = "SUB_COMMAND_GROUP";
    /** A string. */
    CommandOptionType[CommandOptionType["STRING"] = 3] = "STRING";
    /** An integer. */
    CommandOptionType[CommandOptionType["INTEGER"] = 4] = "INTEGER";
    /** A boolean. */
    CommandOptionType[CommandOptionType["BOOLEAN"] = 5] = "BOOLEAN";
    /** A user, this would return the user's ID in the interaction. */
    CommandOptionType[CommandOptionType["USER"] = 6] = "USER";
    /** A channel, this would return the channel's ID in the interaction. */
    CommandOptionType[CommandOptionType["CHANNEL"] = 7] = "CHANNEL";
    /** A role, this would return the role's ID in the interaction. */
    CommandOptionType[CommandOptionType["ROLE"] = 8] = "ROLE";
})(CommandOptionType = exports.CommandOptionType || (exports.CommandOptionType = {}));
exports.ImageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
exports.ImageSizeBoundaries = {
    MINIMUM: 16,
    MAXIMUM: 4096
};
exports.PermissionNames = {
    CREATE_INSTANT_INVITE: 'Create instant invite',
    KICK_MEMBERS: 'Kick members',
    BAN_MEMBERS: 'Ban members',
    ADMINISTRATOR: 'Administrator',
    MANAGE_CHANNELS: 'Manage channels',
    MANAGE_GUILD: 'Manage server',
    ADD_REACTIONS: 'Add reactions',
    VIEW_AUDIT_LOG: 'View audit log',
    PRIORITY_SPEAKER: 'Priority speaker',
    STREAM: 'Stream',
    VIEW_CHANNEL: 'Read text channels and see voice channels',
    SEND_MESSAGES: 'Send messages',
    SEND_TTS_MESSAGES: 'Send TTS messages',
    MANAGE_MESSAGES: 'Manage messages',
    EMBED_LINKS: 'Embed links',
    ATTACH_FILES: 'Attach files',
    READ_MESSAGE_HISTORY: 'Read message history',
    MENTION_EVERYONE: 'Mention everyone',
    USE_EXTERNAL_EMOJIS: 'Use external emojis',
    VIEW_GUILD_INSIGHTS: 'View server insights',
    CONNECT: 'Connect',
    SPEAK: 'Speak',
    MUTE_MEMBERS: 'Mute members',
    DEAFEN_MEMBERS: 'Deafen members',
    MOVE_MEMBERS: 'Move members',
    USE_VAD: 'Use voice activity',
    CHANGE_NICKNAME: 'Change nickname',
    MANAGE_NICKNAMES: 'Manage nicknames',
    MANAGE_ROLES: 'Manage roles',
    MANAGE_WEBHOOKS: 'Manage webhooks',
    MANAGE_EMOJIS: 'Manage emojis'
};
exports.Endpoints = {
    // Commands
    COMMANDS: (applicationID) => `/applications/${applicationID}/commands`,
    GUILD_COMMANDS: (applicationID, guildID) => `/applications/${applicationID}/guilds/${guildID}/commands`,
    COMMAND: (applicationID, commandID) => `/applications/${applicationID}/commands/${commandID}`,
    GUILD_COMMAND: (applicationID, guildID, commandID) => `/applications/${applicationID}/guilds/${guildID}/commands/${commandID}`,
    // Interactions
    INTERACTION_CALLBACK: (interactionID, interactionToken) => `/interactions/${interactionID}/${interactionToken}/callback`,
    MESSAGE: (applicationID, interactionToken, messageID = '@original') => `/webhooks/${applicationID}/${interactionToken}/messages/${messageID}`,
    FOLLOWUP_MESSAGE: (applicationID, interactionToken) => `/webhooks/${applicationID}/${interactionToken}`,
    // CDN
    DEFAULT_USER_AVATAR: (userDiscriminator) => `/embed/avatars/${userDiscriminator}`,
    USER_AVATAR: (userID, userAvatar) => `/avatars/${userID}/${userAvatar}`
};
