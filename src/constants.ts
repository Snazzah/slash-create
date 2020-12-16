import { IncomingMessage } from 'http';

export const API_VERSION = 8;
export const INTERACTION_VERSION = 1;
export const API_BASE_URL = `/api/v${API_VERSION}`;
export const CDN_URL = 'https://cdn.discordapp.com';

export enum InteractionType {
  // A ping
  PING = 1,
  // A command invocation
  COMMAND = 2
}

export enum InterationResponseType {
  // Acknowledge a `PING`.
  PONG = 1,
  // Acknowledge a command without sending a message.
  ACKNOWLEDGE = 2,
  // Respond with a message.
  CHANNEL_MESSAGE = 3,
  // Respond with a message, showing the user's input.
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  // Acknowledge a command without sending a message, showing the user's input.
  ACKNOWLEDGE_WITH_SOURCE = 5
}

export enum InteractionResponseFlags {
  // Sends a message back to the invoker, similar to messages by Clyde.
  EPHEMERAL = 1 << 6
}

export enum CommandOptionType {
  // A sub-command for the application's command
  SUB_COMMAND = 1,
  // A group of sub-commands
  SUB_COMMAND_GROUP = 2,
  // A string
  STRING = 3,
  // An integer
  INTEGER = 4,
  // A boolean
  BOOLEAN = 5,
  // A user, this would return the user's ID in the interaction
  USER = 6,
  // A channel, this would return the channel's ID in the interaction
  CHANNEL = 7,
  // A role, this would return the role's ID in the interaction
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

export type AllRequestData = PingRequestData | InteractionRequestData;

export interface RequestData {
  version: 1;
  type: InteractionType;
}

export interface PingRequestData {
  version: 1;
  type: InteractionType.PING;
  token: string;
  id: string;
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
