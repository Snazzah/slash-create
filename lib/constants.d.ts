/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare const API_VERSION = 8;
export declare const INTERACTION_VERSION = 1;
export declare const API_BASE_URL: string;
export declare const CDN_URL = "https://cdn.discordapp.com";
/** The types of interactions. */
export declare enum InteractionType {
    /** A ping. */
    PING = 1,
    /** A command invocation. */
    COMMAND = 2
}
/** The types of interaction responses. */
export declare enum InterationResponseType {
    /** Acknowledge a `PING`. */
    PONG = 1,
    /** Acknowledge a command without sending a message. */
    ACKNOWLEDGE = 2,
    /** Respond with a message. */
    CHANNEL_MESSAGE = 3,
    /** Respond with a message, showing the user's input. */
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    /** Acknowledge a command without sending a message, showing the user's input. */
    ACKNOWLEDGE_WITH_SOURCE = 5
}
/** Message flags for interaction responses. */
export declare enum InteractionResponseFlags {
    /** Sends a message back to the invoker, similar to messages by Clyde. */
    EPHEMERAL = 64
}
/**
 * An object mapping the types a command option can use.
 */
export declare enum CommandOptionType {
    /** A sub-command for the application's command */
    SUB_COMMAND = 1,
    /** A group of sub-commands */
    SUB_COMMAND_GROUP = 2,
    /** A string. */
    STRING = 3,
    /** An integer. */
    INTEGER = 4,
    /** A boolean. */
    BOOLEAN = 5,
    /** A user, this would return the user's ID in the interaction. */
    USER = 6,
    /** A channel, this would return the channel's ID in the interaction. */
    CHANNEL = 7,
    /** A role, this would return the role's ID in the interaction. */
    ROLE = 8
}
/**
 * An partial application command in Discord.
 * @private
 */
export interface PartialApplicationCommand {
    /** The name of the command. */
    name: string;
    /** The description of the command. */
    description: string;
    /** The optoins for the command. */
    options?: ApplicationCommandOption[];
}
/**
 * An application command in Discord.
 * @private
 */
export interface ApplicationCommand extends PartialApplicationCommand {
    /** The command's ID. */
    id: string;
    /** The application's ID responsible for this command. */
    application_id: string;
}
/** An option in an application command. */
export interface ApplicationCommandOption {
    /** The type of option this one is. */
    type: CommandOptionType;
    /** The name of the option. */
    name: string;
    /** The description of the option. */
    description: string;
    /** The first required option the user has to complete. */
    default?: boolean;
    /** Whether the command is required. */
    required?: boolean;
    /** The choices of the option. If set, these are the only values a user can pick from. */
    choices?: ApplicationCommandOptionChoice[];
    /** The sub-options for the option. This can only be used for sub-commands and sub-command groups. */
    options?: ApplicationCommandOption[];
}
/** A choice for a user to pick from. */
export interface ApplicationCommandOptionChoice {
    /** The name of the choice. */
    name: string;
    /** The value of the choice. */
    value: string | number;
}
/** @private */
export interface RawRequest {
    method: string;
    url: string;
    auth: boolean;
    body: any;
    route: string;
    short: boolean;
    resp: IncomingMessage;
}
/** Any interaction request from Discord. */
export declare type AnyRequestData = PingRequestData | InteractionRequestData;
/** @private */
export interface RequestData {
    version: 1;
    type: InteractionType;
    token: string;
    id: string;
}
/**
 * A ping interaction.
 * @private
 */
export interface PingRequestData {
    version: 1;
    type: InteractionType.PING;
    token: string;
    id: string;
}
/**
 * A command interaction.
 * @private
 */
export interface InteractionRequestData {
    version: 1;
    type: InteractionType.COMMAND;
    token: string;
    id: string;
    channel_id: string;
    guild_id: string;
    member: CommandMember;
    data: CommandData;
}
/** @private */
export interface CommandMember {
    user: CommandUser;
    roles: string[];
    premium_since: string | null;
    permissions: string;
    pending: boolean;
    is_pending: boolean;
    mute: boolean;
    deaf: boolean;
    nick: string | null;
    joined_at: string;
}
/** @private */
export interface CommandUser {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    public_flags: number;
}
/** @hidden */
export interface UserObject extends CommandUser {
    /** Whether this user is a bot. */
    bot?: boolean;
}
/** @private */
export interface CommandData {
    id: string;
    name: string;
    options?: AnyCommandOption[];
}
/** @private */
export declare type AnyCommandOption = CommandOption | CommandSubcommandOption;
/** @private */
export interface CommandOption {
    /** The name for the option. */
    name: string;
    value?: string | number | boolean;
}
/** @private */
export interface CommandSubcommandOption {
    /** The name for the option. */
    name: string;
    options: CommandOption[];
}
/** @see https://www.npmjs.com/package/require-all#usage */
export interface RequireAllOptions {
    dirname: string;
    filter?: ((name: string, path: string) => string | false | undefined) | RegExp;
    excludeDirs?: RegExp;
    map?: (name: string, path: string) => string;
    resolve?: (module: any) => any;
    recursive?: true | false;
}
/** Any image format supported by Discord. */
export declare type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif';
export declare const ImageFormats: string[];
export declare const ImageSizeBoundaries: {
    MINIMUM: number;
    MAXIMUM: number;
};
export declare const PermissionNames: {
    [perm: string]: string;
};
export declare const Endpoints: {
    COMMANDS: (applicationID: string) => string;
    GUILD_COMMANDS: (applicationID: string, guildID: string) => string;
    COMMAND: (applicationID: string, commandID: string) => string;
    GUILD_COMMAND: (applicationID: string, guildID: string, commandID: string) => string;
    INTERACTION_CALLBACK: (interactionID: string, interactionToken: string) => string;
    MESSAGE: (applicationID: string, interactionToken: string, messageID?: string) => string;
    FOLLOWUP_MESSAGE: (applicationID: string, interactionToken: string) => string;
    DEFAULT_USER_AVATAR: (userDiscriminator: string | number) => string;
    USER_AVATAR: (userID: string, userAvatar: string) => string;
};
