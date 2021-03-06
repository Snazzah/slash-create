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
    /** Respond with a message, showing the user's input. */
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    /** Create a deferred message with source. */
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5
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
/** @hidden */
export interface BulkUpdateCommand extends PartialApplicationCommand {
    /** The command's ID. */
    id?: string;
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
    /** The guild ID this comamnd is exlusive to. */
    guild_id?: string;
    /** The version ID of the command. */
    version: string;
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
    user?: CommandUser;
    token: string;
    id: string;
}
/**
 * A command interaction within a direct message.
 * @private
 */
export interface DMInteractionRequestData {
    version: 1;
    type: InteractionType.COMMAND;
    token: string;
    id: string;
    channel_id: string;
    user: CommandUser;
    data: CommandData;
}
/**
 * A command interaction within a guild.
 * @private
 */
export interface GuildInteractionRequestData {
    version: 1;
    type: InteractionType.COMMAND;
    token: string;
    id: string;
    channel_id: string;
    guild_id: string;
    member: CommandMember;
    data: CommandData;
}
/**
 * Any command interaction.
 * @private
 */
export declare type InteractionRequestData = DMInteractionRequestData | GuildInteractionRequestData;
/** @private */
export interface ResolvedMember {
    roles: string[];
    premium_since: string | null;
    pending: boolean;
    is_pending: boolean;
    nick: string | null;
    joined_at: string;
}
/** @private */
export interface CommandMember extends ResolvedMember {
    user: CommandUser;
    mute: boolean;
    deaf: boolean;
    permissions: string;
}
/** @private */
export interface CommandUser {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    public_flags: number;
}
/** @private */
export interface ResolvedRole {
    color: number;
    hoist: boolean;
    id: string;
    managed: boolean;
    mentionable: boolean;
    name: string;
    permissions: string;
    position: number;
}
/** @private */
export interface ResolvedChannel {
    id: string;
    name: string;
    permissions: string;
    type: number;
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
    resolved?: {
        users?: {
            [id: string]: CommandUser;
        };
        members?: {
            [id: string]: ResolvedMember;
        };
        roles?: {
            [id: string]: ResolvedRole;
        };
        channels?: {
            [id: string]: ResolvedChannel;
        };
    };
}
/** @private */
export declare type AnyCommandOption = CommandStringOption | CommandIntegerOption | CommandBooleanOption | CommandSubcommandOption;
/**
 * @private
 * @deprecated
 */
export interface CommandOption {
    /** The name for the option. */
    name: string;
    type?: CommandOptionType;
    value?: string | number | boolean;
}
/** @private */
export interface CommandStringOption {
    /** The name for the option. */
    name: string;
    type?: CommandOptionType.STRING | CommandOptionType.USER | CommandOptionType.CHANNEL | CommandOptionType.ROLE;
    value: string;
}
/** @private */
export interface CommandIntegerOption {
    /** The name for the option. */
    name: string;
    type?: CommandOptionType.INTEGER;
    value: number;
}
/** @private */
export interface CommandBooleanOption {
    /** The name for the option. */
    name: string;
    type?: CommandOptionType.BOOLEAN;
    value: boolean;
}
/** @private */
export interface CommandSubcommandOption {
    /** The name for the option. */
    name: string;
    type?: CommandOptionType.SUB_COMMAND | CommandOptionType.SUB_COMMAND_GROUP;
    options?: AnyCommandOption[];
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
