/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare const API_VERSION = 8;
export declare const INTERACTION_VERSION = 1;
export declare const API_BASE_URL: string;
export declare const CDN_URL = "https://cdn.discordapp.com";
export declare enum InteractionType {
    PING = 1,
    COMMAND = 2
}
export declare enum InterationResponseType {
    PONG = 1,
    ACKNOWLEDGE = 2,
    CHANNEL_MESSAGE = 3,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    ACKNOWLEDGE_WITH_SOURCE = 5
}
export declare enum InteractionResponseFlags {
    EPHEMERAL = 64
}
export declare enum CommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8
}
export interface PartialApplicationCommand {
    name: string;
    description: string;
    options?: ApplicationCommandOption[];
}
export interface ApplicationCommand extends PartialApplicationCommand {
    id: string;
    application_id: string;
}
export interface ApplicationCommandOption {
    type: CommandOptionType;
    name: string;
    description: string;
    default?: boolean;
    required?: boolean;
    choices?: ApplicationCommandOptionChoice[];
    options?: ApplicationCommandOption[];
}
export interface ApplicationCommandOptionChoice {
    name: string;
    value: string | number;
}
export interface RawRequest {
    method: string;
    url: string;
    auth: boolean;
    body: any;
    route: string;
    short: boolean;
    resp: IncomingMessage;
}
export declare type AllRequestData = PingRequestData | InteractionRequestData;
export interface RequestData {
    version: 1;
    type: InteractionType;
}
export interface PingRequestData {
    version: 1;
    type: InteractionType.PING;
}
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
export interface CommandMember {
    user: CommandUser;
    roles: string[];
    premium_since?: string;
    permissions: string;
    pending: boolean;
    is_pending: boolean;
    mute: boolean;
    deaf: boolean;
    nick?: string;
    joined_at: string;
}
export interface CommandUser {
    id: string;
    username: string;
    avatar?: string;
    discriminator: string;
    public_flags: number;
}
export interface UserObject extends CommandUser {
    bot?: boolean;
}
export interface CommandData {
    id: string;
    name: string;
    options?: CommandOption[];
}
export interface CommandOption {
    name: string;
    value?: string | number | boolean;
    options?: CommandOption[];
}
export interface RequireAllOptions {
    dirname: string;
    filter?: ((name: string, path: string) => string | false | undefined) | RegExp;
    excludeDirs?: RegExp;
    map?: (name: string, path: string) => string;
    resolve?: (module: any) => any;
    recursive?: true | false;
}
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
