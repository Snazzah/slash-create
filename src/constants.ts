import { IncomingMessage } from 'http';
import SlashCommand from './command';
import CommandContext from './context';
import SlashCreator from './creator';
import { TransformedRequest } from './server';

export const API_VERSION = 8;
export const INTERACTION_VERSION = 1;
export const API_BASE_URL = `/api/v${API_VERSION}`;
export const CDN_URL = 'https://cdn.discordapp.com';

/** The types of interactions. */
export enum InteractionType {
  /** A ping. */
  PING = 1,
  /** A command invocation. */
  COMMAND = 2
}

/** The types of interaction responses. */
export enum InterationResponseType {
  /** Acknowledge a `PING`. */
  PONG = 1,
  // ACKNOWLEDGE = 2,
  // CHANNEL_MESSAGE = 3,
  /** Respond with a message, showing the user's input. */
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  /** Create a deferred message with source. */
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5
}

/** Message flags for interaction responses. */
export enum InteractionResponseFlags {
  /** Sends a message back to the invoker, similar to messages by Clyde. */
  EPHEMERAL = 1 << 6
}

/**
 * An object mapping the types a command option can use.
 */
export enum CommandOptionType {
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
  /** Whether to enable this command for everyone by default. */
  default_permission?: boolean;
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

/** The type of thing to apply the permission to. */
export enum ApplicationCommandPermissionType {
  /** A Discord role. */
  ROLE = 1,
  /** A Discord user. */
  USER = 2
}

/** A permission in a command. */
export interface ApplicationCommandPermissions {
  id: string;
  type: ApplicationCommandPermissionType;
  permission: boolean;
}

/** @private */
export interface PartialApplicationCommandPermissions {
  id: string;
  permissions: ApplicationCommandPermissions[];
}

/** @private */
export interface GuildApplicationCommandPermissions extends PartialApplicationCommandPermissions {
  application_id: string;
  guild_id: string;
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
export type AnyRequestData = PingRequestData | InteractionRequestData;

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
export type InteractionRequestData = DMInteractionRequestData | GuildInteractionRequestData;

/** @private */
export interface ResolvedMemberData {
  roles: string[];
  premium_since: string | null;
  pending: boolean;
  is_pending: boolean;
  nick: string | null;
  joined_at: string;
}

/** @private */
export interface CommandMember extends ResolvedMemberData {
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
    users?: { [id: string]: CommandUser };
    members?: { [id: string]: ResolvedMemberData };
    roles?: { [id: string]: ResolvedRole };
    channels?: { [id: string]: ResolvedChannel };
  };
}

/** @private */
export type AnyCommandOption =
  | CommandStringOption
  | CommandIntegerOption
  | CommandBooleanOption
  | CommandSubcommandOption;

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
export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif';

export const ImageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export const ImageSizeBoundaries = {
  MINIMUM: 16,
  MAXIMUM: 4096
};

export const PermissionNames: { [perm: string]: string } = {
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

export const Endpoints = {
  // Commands
  COMMANDS: (applicationID: string) => `/applications/${applicationID}/commands`,
  GUILD_COMMANDS: (applicationID: string, guildID: string) =>
    `/applications/${applicationID}/guilds/${guildID}/commands`,
  COMMAND: (applicationID: string, commandID: string) => `/applications/${applicationID}/commands/${commandID}`,
  GUILD_COMMAND: (applicationID: string, guildID: string, commandID: string) =>
    `/applications/${applicationID}/guilds/${guildID}/commands/${commandID}`,

  // Command Permissions
  GUILD_COMMAND_PERMISSIONS: (applicationID: string, guildID: string) =>
    `/applications/${applicationID}/guilds/${guildID}/commands/permissions`,
  COMMAND_PERMISSIONS: (applicationID: string, guildID: string, commandID: string) =>
    `/applications/${applicationID}/guilds/${guildID}/commands/${commandID}/permissions`,

  // Interactions
  INTERACTION_CALLBACK: (interactionID: string, interactionToken: string) =>
    `/interactions/${interactionID}/${interactionToken}/callback`,
  MESSAGE: (applicationID: string, interactionToken: string, messageID = '@original') =>
    `/webhooks/${applicationID}/${interactionToken}/messages/${messageID}`,
  FOLLOWUP_MESSAGE: (applicationID: string, interactionToken: string) =>
    `/webhooks/${applicationID}/${interactionToken}`,

  // CDN
  DEFAULT_USER_AVATAR: (userDiscriminator: string | number) => `/embed/avatars/${userDiscriminator}`,
  USER_AVATAR: (userID: string, userAvatar: string) => `/avatars/${userID}/${userAvatar}`
};

// SlashCreator events for documentation.
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Emitted when Discord pings the interaction endpoint.
 * @event
 * @asMemberOf SlashCreator
 * @param user The user that requested the ping
 */
declare function ping(user?: CommandUser): void;
/**
 * Emitted when the creator successfully synced commands.
 * @event
 * @asMemberOf SlashCreator
 */
declare function synced(): void;
/**
 * Emitted when the Client's RequestHandler receives a response.
 * @event
 * @asMemberOf SlashCreator
 * @param request The data for the request
 */
declare function rawREST(request: RawRequest): void;
/**
 * Emitted when a warning is given.
 * @event
 * @asMemberOf SlashCreator
 * @param warning The warning
 */
declare function warn(warning: Error | string): void;
/**
 * Emitted when a debug message is given.
 * @event
 * @asMemberOf SlashCreator
 * @param message The debug message
 */
declare function debug(message: string): void;
/**
 * Emitted when an error occurred
 * @event
 * @asMemberOf SlashCreator
 * @param err The error thrown
 */
declare function error(err: Error): void;
/**
 * Emitted when a request failed to be verified.
 * @event
 * @asMemberOf SlashCreator
 * @param treq The unverified request
 */
declare function unverifiedRequest(treq: TransformedRequest): void;
/**
 * Emitted when an unknown interaction type is encountered.
 * @event
 * @asMemberOf SlashCreator
 * @param interaction The unhandled interaction
 */
declare function unknownInteraction(interaction: any): void;
/**
 * Emitted when a command is registered.
 * @event
 * @asMemberOf SlashCreator
 * @param command Command that was registered
 * @param creator Creator that the command was registered to
 */
declare function commandRegister(command: SlashCommand, creator: SlashCreator): void;
/**
 * Emitted when a command is unregistered
 * @event
 * @asMemberOf SlashCreator
 * @param command Command that was unregistered
 */
declare function commandUnregister(command: SlashCommand): void;
/**
 * Emitted when a command is reregistered
 * @event
 * @asMemberOf SlashCreator
 * @param newCommand New command
 * @param oldCommand Old command
 */
declare function commandReregister(command: SlashCommand, oldCommand: SlashCommand): void;
/**
 * Emitted when a command is blocked.
 * @event
 * @asMemberOf SlashCreator
 * @param command Command that was blocked
 * @param ctx The context of the interaction
 * @param reason Reason that the command was blocked
 * @param data Additional data associated with the block.
 */
declare function commandBlock(command: SlashCommand, ctx: CommandContext, reason: string, data: any): void;
/**
 * Emitted when a command gave an error.
 * @event
 * @asMemberOf SlashCreator
 * @param command Command that gave an error
 * @param err The error given
 * @param ctx The context of the interaction
 */
declare function commandError(command: SlashCommand, err: Error, ctx: CommandContext): void;
/**
 * Emitted when a command is ran.
 * @event
 * @asMemberOf SlashCreator
 * @param command Command that was ran
 * @param promise Promise for the command result
 * @param ctx The context of the interaction
 */
declare function commandRun(command: SlashCommand, promise: Promise<any>, ctx: CommandContext): void;
