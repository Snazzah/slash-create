import type { SlashCommand } from './command';
import type { CommandContext } from './structures/interfaces/commandContext';
import type { RespondFunction, TransformedRequest } from './server';
import type { ComponentContext } from './structures/interfaces/componentContext';
import type { Message, MessageData } from './structures/message';
import type { AutocompleteContext } from './structures/interfaces/autocompleteContext';
import type { ModalInteractionContext } from './structures/interfaces/modalInteractionContext';
import type { BaseSlashCreator } from './creator';
import type { FileContent } from './rest/requestHandler';
import type { Request } from './rest/request';
import type { Response } from 'undici';

export const VERSION: string = require('../package.json').version;

export const API_VERSION = 10;
export const INTERACTION_VERSION = 1;
export const API_BASE_URL = 'https://discord.com/api/v' + API_VERSION;
export const CDN_URL = 'https://cdn.discordapp.com';

/** The types of interactions. */
export enum InteractionType {
  /** A ping. */
  PING = 1,
  /** A command invocation. */
  APPLICATION_COMMAND = 2,
  /** An invocation of a message component. */
  MESSAGE_COMPONENT = 3,
  /** An autocomplete invocation of a command. */
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  /** A modal submission. */
  MODAL_SUBMIT = 5
}

/** The types of interaction responses. */

export enum InteractionResponseType {
  /** Acknowledge a `PING`. */
  PONG = 1,
  // ACKNOWLEDGE = 2,
  // CHANNEL_MESSAGE = 3,
  /** Respond with a message, showing the user's input. */
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  /** Create a deferred message with source. */
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  /** Acknowledge the interaction, edit the original message later. */
  DEFERRED_UPDATE_MESSAGE = 6,
  /** Edits the message the component was attached to. */
  UPDATE_MESSAGE = 7,
  /** Responds to an autocomplete interaction request. */
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  /** Respond to an interaction with a popup modal. */
  MODAL = 9,
  /**
   * Respond to an interaction with prompt for a premium subscription.
   * @deprecated Use `ComponentButtonPremium` instead.
   */
  PREMIUM_REQUIRED = 10,
  /** Launch the activity for this application */
  LAUNCH_ACTIVITY = 12
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
  ROLE = 8,
  /** Anything mentionable, returning the ID of the object. */
  MENTIONABLE = 9,
  /** A decimal. */
  NUMBER = 10,
  /** An attachment. */
  ATTACHMENT = 11
}

/** The types of application commands available. */
export enum ApplicationCommandType {
  /** Slash commands; a text-based command that shows up when a user types `/` */
  CHAT_INPUT = 1,
  /** A UI-based command that shows up when you right click or tap on a user */
  USER = 2,
  /** A UI-based command that shows up when you right click or tap on a messages */
  MESSAGE = 3
}

/** The types of channels in Discord channels. */
export enum ChannelType {
  /** A text channel. */
  GUILD_TEXT = 0,
  /** A direct message between users. */
  DM = 1,
  /** A voice channel. */
  GUILD_VOICE = 2,
  /** A direct message between multiple users. */
  GROUP_DM = 3,
  /** A channel category containing up to 50 channels. */
  GUILD_CATEGORY = 4,
  /** A channel that users can follow and crosspost into their own server. */
  GUILD_NEWS = 5,
  /** A channel in which game developers can sell their game. */
  GUILD_STORE = 6,
  /** A temporary sub-channel within a `GUILD_NEWS` channel. */
  GUILD_NEWS_THREAD = 10,
  /** A temporary sub-channel within a `GUILD_TEXT` channel. */
  GUILD_PUBLIC_THREAD = 11,
  /** A temporary sub-channel within a `GUILD_TEXT` channel. */
  GUILD_PRIVATE_THREAD = 12,
  /** A voice channel for hosting events with an audience. */
  GUILD_STAGE_VOICE = 13,
  /** The channel in a hub containing the listed servers. */
  GUILD_DIRECTORY = 14,
  /** A channel that can only contain threads. */
  GUILD_FORUM = 15
}

/** The formats that stickers can be in. */
export enum StickerFormat {
  PNG = 1,
  APNG = 2,
  LOTTIE = 3,
  GIF = 4
}

/**
 * An partial application command in Discord.
 * @private
 */
export interface PartialApplicationCommand {
  /** The name of the command. */
  name: string;
  /** The localiztions for the command name. */
  name_localizations?: Record<string, string> | null;
  /** The description of the command. */
  description?: string;
  /** The localiztions for the command description. */
  description_localizations?: Record<string, string> | null;
  /** The options for the command. */
  options?: ApplicationCommandOption[];
  /**
   * Whether to enable this command for everyone by default.
   * @deprecated
   */
  default_permission?: boolean;
  /** Whether to enable this command in direct messages. */
  dm_permission?: boolean | null;
  /** The member permissions required to use this command. */
  default_member_permissions?: string | null;
  /** Whether this command is age-restricted. */
  nsfw?: boolean | null;
  /** The interaction contexts where this command is available. */
  integration_types?: ApplicationIntegrationType[];
  /** The interaction contexts where this command can be used. */
  contexts?: InteractionContextType[] | null;
  /** The type of application this is representing. `1` by default. */
  type?: ApplicationCommandType;
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

export interface ApplicationCommandOptionBase {
  /** The type of option this one is. */
  type:
    | CommandOptionType.BOOLEAN
    | CommandOptionType.USER
    | CommandOptionType.ROLE
    | CommandOptionType.MENTIONABLE
    | CommandOptionType.ATTACHMENT;
  /** The name of the option. */
  name: string;
  /** The localiztions for the option name. */
  name_localizations?: Record<string, string> | null;
  /** The description of the option. */
  description: string;
  /** The localiztions for the option description. */
  description_localizations?: Record<string, string> | null;
  /** Whether the parameter is required. */
  required?: boolean;
}

/**
 * @private
 */
export interface ApplicationCommandOptionSubCommand extends Omit<ApplicationCommandOptionBase, 'type'> {
  /** The type of option this one is. */
  type: CommandOptionType.SUB_COMMAND | CommandOptionType.SUB_COMMAND_GROUP;
  /** The sub-options for the option. This can only be used for sub-commands and sub-command groups. */
  options?: ApplicationCommandOption[];
}

/**
 * @private
 */
export interface ApplicationCommandOptionArgument extends Omit<ApplicationCommandOptionBase, 'type'> {
  /** The type of option this one is. */
  type: CommandOptionType.STRING | CommandOptionType.INTEGER | CommandOptionType.NUMBER;
  /** The choices of the option. If set, these are the only values a user can pick from. */
  choices?: ApplicationCommandOptionChoice[];
}

/**
 * @private
 */
export interface ApplicationCommandOptionAutocompletable extends Omit<ApplicationCommandOptionBase, 'type'> {
  /** The type of option this one is. */
  type: CommandOptionType.STRING | CommandOptionType.INTEGER | CommandOptionType.NUMBER;
  /** Whether this option can be autocompleted. */
  autocomplete?: boolean;
}

/**
 * @private
 */
export interface ApplicationCommandOptionChannel extends Omit<ApplicationCommandOptionBase, 'type'> {
  /** The type of option this one is. */
  type: CommandOptionType.CHANNEL;
  /** An array of channel types this option can be. */
  channel_types?: ChannelType[];
}

/**
 * @private
 */
export interface ApplicationCommandOptionLimitedNumber extends Omit<ApplicationCommandOptionBase, 'type'> {
  /** The type of option this one is. */
  type: CommandOptionType.INTEGER | CommandOptionType.NUMBER;
  /** Whether this option can be autocompleted. */
  autocomplete?: boolean;
  /** The minimum value permitted. */
  min_value?: number;
  /** The maximum value permitted. */
  max_value?: number;
}

/**
 * @private
 */
export interface ApplicationCommandOptionLimitedString extends Omit<ApplicationCommandOptionBase, 'type'> {
  /** The type of option this one is. */
  type: CommandOptionType.STRING;
  /** Whether this option can be autocompleted. */
  autocomplete?: boolean;
  /** The minimum length permitted. */
  min_length?: number;
  /** The maximum length permitted. */
  max_length?: number;
}

/** An option in an application command. */
export type ApplicationCommandOption =
  | ApplicationCommandOptionBase
  | ApplicationCommandOptionSubCommand
  | ApplicationCommandOptionArgument
  | ApplicationCommandOptionAutocompletable
  | ApplicationCommandOptionChannel
  | ApplicationCommandOptionLimitedNumber
  | ApplicationCommandOptionLimitedString;

/** A choice for a user to pick from. */
export interface ApplicationCommandOptionChoice {
  /** The name of the choice. */
  name: string;
  /** The value of the choice. */
  value: string | number;
  /** The localiztions for the option name. */
  name_localizations?: Record<string, string> | null;
}

/** The type of thing to apply the permission to. */
export enum ApplicationCommandPermissionType {
  /** A Discord role. */
  ROLE = 1,
  /** A Discord user. */
  USER = 2,
  /** A Discord channel. */
  CHANNEL = 3
}

/** The type of context an interaction can apply to. */
export enum InteractionContextType {
  /** Interaction can be used within servers */
  GUILD = 0,
  /** Interaction can be used within DMs with the app's bot user */
  BOT_DM = 1,
  /**	Interaction can be used within Group DMs and DMs other than the app's bot user */
  PRIVATE_CHANNEL = 2
}

/** The type of context an app can install to. */
export enum ApplicationIntegrationType {
  /** App is installable to guilds. */
  GUILD_INSTALL = 0,
  /** App is installable to users. */
  USER_INSTALL = 1
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
  auth: boolean;
  body: Record<string, any> | undefined;
  files: FileContent[] | undefined;
  latency: number;
  url: URL;
  method: string;
  response: Response;
  request: Request;
}

/** Any interaction request from Discord. */
export type AnyRequestData =
  | PingRequestData
  | InteractionRequestData
  | MessageComponentRequestData
  | CommandAutocompleteRequestData
  | ModalSubmitRequestData;

/** @private */
export interface RequestData {
  version: 1;
  application_id: string;
  type: InteractionType;
  token: string;
  id: string;
  app_permissions?: string;
}

/**
 * A ping interaction.
 * @private
 */
export interface PingRequestData {
  version: 1;
  application_id: string;
  type: InteractionType.PING;
  user?: CommandUser;
  token: string;
  id: string;
  app_permissions?: string;
}

/**
 * A modal submission within a direct message.
 * @private
 */
export interface DMModalSubmitRequestData {
  version: 1;
  application_id: string;
  type: InteractionType.MODAL_SUBMIT;
  token: string;
  id: string;
  channel_id: string;
  locale?: string;
  user: CommandUser;
  message?: MessageData;
  app_permissions?: string;
  entitlements: AppEntitlement[];
  authorizing_integration_owners?: Record<ApplicationIntegrationType, string>;
  context?: InteractionContextType;
  data: {
    custom_id: string;
    components: AnyComponent[];
  };
}

/**
 * A modal submission within a guild.
 * @private
 */
export interface GuildModalSubmitRequestData {
  version: 1;
  application_id: string;
  type: InteractionType.MODAL_SUBMIT;
  token: string;
  id: string;
  channel_id: string;
  guild_id: string;
  locale?: string;
  guild_locale?: string;
  member: CommandMember;
  message?: MessageData;
  app_permissions?: string;
  entitlements: AppEntitlement[];
  authorizing_integration_owners?: Record<ApplicationIntegrationType, string>;
  context?: InteractionContextType;
  data: {
    custom_id: string;
    components: AnyComponent[];
  };
}

/**
 * Any modal submission.
 * @private
 */
export type ModalSubmitRequestData = DMModalSubmitRequestData | GuildModalSubmitRequestData;

/**
 * A command interaction within a direct message.
 * @private
 */
export interface DMInteractionRequestData {
  version: 1;
  application_id: string;
  type: InteractionType.APPLICATION_COMMAND;
  token: string;
  id: string;
  channel_id: string;
  locale?: string;
  user: CommandUser;
  channel: CommandChannel;
  app_permissions?: string;
  entitlements: AppEntitlement[];
  authorizing_integration_owners?: Record<ApplicationIntegrationType, string>;
  context?: InteractionContextType;
  data: CommandData;
}

/**
 * A command interaction within a guild.
 * @private
 */
export interface GuildInteractionRequestData {
  version: 1;
  application_id: string;
  type: InteractionType.APPLICATION_COMMAND;
  token: string;
  id: string;
  channel_id: string;
  guild_id: string;
  locale?: string;
  guild_locale?: string;
  member: CommandMember;
  channel: CommandChannel;
  app_permissions?: string;
  entitlements: AppEntitlement[];
  authorizing_integration_owners?: Record<ApplicationIntegrationType, string>;
  context?: InteractionContextType;
  data: CommandData;
}

/**
 * Any command interaction.
 * @private
 */
export type InteractionRequestData = DMInteractionRequestData | GuildInteractionRequestData;

/** The partial message from a message component interaction. */
export interface PartialMessage {
  /** The ID of the message. */
  id: string;
  /** The message flags. */
  flags: number;
}

/** The partial emoji from a message component. */
export interface PartialEmoji {
  /** The ID of the emoji, if it is custom. */
  id?: string;
  /** The name of the emoji, or the raw emoji if not custom. */
  name?: string;
  /** Whether this emoji is animated. */
  animated?: boolean;
}

/**
 * A message component interaction within a direct message.
 * @private
 */
export interface DMMessageComponentRequestData {
  version: 1;
  application_id: string;
  type: InteractionType.MESSAGE_COMPONENT;
  token: string;
  message: MessageData;
  id: string;
  channel_id: string;
  locale?: string;
  guild_locale?: string;
  user: CommandUser;
  channel: CommandChannel;
  app_permissions?: string;
  entitlements: AppEntitlement[];
  data: {
    custom_id: string;
    component_type: ComponentType;
    values?: string[];
  };
}

/**
 * A message component interaction within a guild.
 * @private
 */
export interface GuildMessageComponentRequestData {
  version: 1;
  application_id: string;
  type: InteractionType.MESSAGE_COMPONENT;
  token: string;
  message: MessageData;
  id: string;
  channel_id: string;
  guild_id: string;
  member: CommandMember;
  channel: CommandChannel;
  entitlements: AppEntitlement[];
  app_permissions?: string;
  data: {
    custom_id: string;
    component_type: ComponentType;
    values?: string[];
  };
}

export interface AppEntitlement {
  id: string;
  sku_id: string;
  user_id?: string;
  guild_id?: string;
  application_id: string;
  type: EntitlementType;
  consumed: boolean;
  starts_at?: string;
  ends_at?: string;
}

export enum EntitlementType {
  APPLICATION_SUBSCRIPTION = 8
}

/**
 * Any message component interaction.
 * @private
 */
export type MessageComponentRequestData = DMMessageComponentRequestData | GuildMessageComponentRequestData;

/**
 * A message component interaction within a direct message.
 * @private
 */
export interface DMCommandAutocompleteRequestData {
  version: 1;
  application_id: string;
  type: InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE;
  token: string;
  id: string;
  channel_id: string;
  user: CommandUser;
  channel: CommandChannel;
  app_permissions?: string;
  data: AutocompleteData;
}

/**
 * A message component interaction within a guild.
 * @private
 */
export interface GuildCommandAutocompleteRequestData {
  version: 1;
  application_id: string;
  type: InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE;
  token: string;
  id: string;
  channel_id: string;
  guild_id: string;
  member: CommandMember;
  channel: CommandChannel;
  app_permissions?: string;
  data: AutocompleteData;
}

/** @private */
export interface AutocompleteData {
  id: string;
  name: string;
  type: ApplicationCommandType;
  version: string;
  options: AnyCommandOption[];
}

/**
 * Any message component interaction.
 * @private
 */
export type CommandAutocompleteRequestData = DMCommandAutocompleteRequestData | GuildCommandAutocompleteRequestData;

/* @private **/
export interface InteractionCallbackResponse {
  interaction: {
    id: string;
    type: InteractionType;
    activity_instance_id?: string;
    response_message_id?: string;
    response_message_loading?: boolean;
    response_message_ephemeral?: boolean;
  };
  resource?: {
    type: InteractionResponseType;
    activity_instance?: {
      id: string;
    };
    message?: MessageData;
  };
}

/** @private */
export interface ResolvedMemberData {
  avatar?: string;
  roles: string[];
  flags: number;
  premium_since: string | null;
  communication_disabled_until: string | null;
  pending: boolean;
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
  avatar_decoration_data: AvatarDecorationData | null;
  global_name: string | null;
  discriminator: string;
  public_flags: number;
}

export interface AvatarDecorationData {
  sku_id: string;
  asset: string;
}

/** @private */
export interface ResolvedRole {
  color: number;
  hoist: boolean;
  id: string;
  icon?: string;
  managed: boolean;
  mentionable: boolean;
  name: string;
  permissions: string;
  position: number;
  unicode_emoji?: string;
  tags?: RoleTags;
}

/** @private */
export interface CommandChannel {
  type: ChannelType;
  last_message_id: string | null;
  id: string;
  flags: number;

  // Guild channels
  topic?: string | null;
  rate_limit_per_user?: number;
  position?: number;
  permissions?: string;
  parent_id?: string | null;
  nsfw?: boolean;
  name?: string;
  guild_id?: string;

  // Voice/Stage channels
  rtc_region?: string | null;
  bitrate?: number;
  user_limit?: number;

  // Thread channels
  total_message_sent?: number;
  thread_metadata?: ThreadMetadata;
  message_count?: number;
  member_ids_preview?: string[];
  member_count?: number;

  // Forum channels
  default_thread_rate_limit_per_user?: number;
  default_sort_order?: number | null;
  default_reaction_emoji?: ForumDefaultReaction | null;
  default_forum_layout?: number;
  default_auto_archive_duration?: number;
  available_tags?: ForumTag[];
  applied_tags?: string[];
}

/** Channel metadata for thread-specific channel fields */
export interface ThreadMetadata {
  /** Whether the thread has been locked */
  locked: boolean;
  /** The timestamp of when the thread was created */
  create_timestamp?: string;
  /** The time, in minutes, of inactivity in the thread until its automatically archived  */
  auto_archive_duration: number;
  /** Whether the thread has been archived */
  archived: boolean;
  /** The timestamp of the last time the archived status was changed */
  archive_timestamp: string;
}

/** A forum channel's tag */
export interface ForumTag {
  /** The name of the tag */
  name: string;
  /** Whether this tag can be added/removed by moderators */
  moderated: boolean;
  /** The ID of the tag */
  id: string;
  /** The name of the emoji associated with the tag */
  emoji_name: string;
  /** The ID of the custom emoji associated with the tag */
  emoji_id: string | null;
}

/** A forum channel's default reaction */
export interface ForumDefaultReaction {
  /** The name of the emoji */
  emoji_name: string;
  /** The ID of the custom emoji */
  emoji_id: string | null;
}

/** A role's tags */
export interface RoleTags {
  /** The ID of the bot that belongs to the role */
  bot_id?: string;
  /** The ID of the integration that belongs to the role */
  integration_id?: string;
  /** Whether this is the guild's booster role */
  premium_subscriber?: null;
  /** The ID of this role's subscription SKU and listing */
  subscription_listing_id?: string;
  /** Whether this role can be purchased */
  available_for_purchase?: null;
  /** Whether this is a guild's linked role */
  guild_connections?: null;
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
    channels?: { [id: string]: CommandChannel };
    messages?: { [id: string]: MessageData };
    attachments?: { [id: string]: AttachmentData };
  };
  type: ApplicationCommandType;
  target_id?: string;
}

/** @private */
export type AnyCommandOption =
  | CommandStringOption
  | CommandIntegerOption
  | CommandBooleanOption
  | CommandSubcommandOption;

/** @private */
export interface CommandStringOption {
  /** The name for the option. */
  name: string;
  type?: CommandOptionType.STRING | CommandOptionType.USER | CommandOptionType.CHANNEL | CommandOptionType.ROLE;
  value: string;
  focused?: boolean;
  min_length?: number;
  max_length?: number;
}

/** @private */
export interface CommandIntegerOption {
  /** The name for the option. */
  name: string;
  type?: CommandOptionType.INTEGER;
  value: number;
  focused?: boolean;
  min_value?: number;
  max_value?: number;
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

/** The response to the initial interaction callback. */
export interface InitialInteractionResponse {
  /** The interaction associated with this response */
  interaction: {
    /** ID of the interaction */
    id: string;
    /** The type of the interaction */
    type: InteractionType;
    /** The instance ID of the activity if one was launched/joined */
    activityInstanceID?: string;
    /** The ID of the message created by the interaction */
    responseMessageID?: string;
    /** Whether or not the message is in a loading state */
    responseMessageLoading?: boolean;
    /** Whether or not the response message is ephemeral */
    responseMessageEphemeral?: boolean;
  };
  /** The resource created by this interaction response. */
  resource?: {
    /** The type of the interaction response */
    type: InteractionResponseType;
    /** The activity instance launched by this interaction */
    activityInstance?: {
      id: string;
    };
    /** The message created by this interaction */
    message?: Message;
  };
}

/** The types of components available. */
export enum ComponentType {
  /** A row of components. */
  ACTION_ROW = 1,
  /** A button component. */
  BUTTON = 2,
  /** A string select component. */
  STRING_SELECT = 3,
  /** A text input. */
  TEXT_INPUT = 4,
  /** A user select component. */
  USER_SELECT = 5,
  /** A role select component. */
  ROLE_SELECT = 6,
  /** A user/role select component. */
  MENTIONABLE_SELECT = 7,
  /** A channel select component. */
  CHANNEL_SELECT = 8
}

/** The types of component button styles. */
export enum ButtonStyle {
  /** A primary-colored button. */
  PRIMARY = 1,
  /** A gray, secondary button. */
  SECONDARY = 2,
  /** A green button. */
  SUCCESS = 3,
  /** A red button. */
  DESTRUCTIVE = 4,
  /** A red button. */
  DANGER = 4,
  /** A gray button with a link icon. */
  LINK = 5,
  /** A premium button. */
  PREMIUM = 6
}

export enum TextInputStyle {
  /** A single-line input */
  SHORT = 1,
  /** A multi-line input */
  PARAGRAPH = 2
}

/** Any component. */
export type AnyComponent = ComponentActionRow | AnyComponentButton | ComponentSelectMenu | ComponentTextInput;

/** A row of components. */
export interface ComponentActionRow {
  /** The type of component to use. */
  type: ComponentType.ACTION_ROW;
  /** The components to show inside this row. */
  components: (AnyComponentButton | ComponentSelectMenu | ComponentTextInput)[];
}

/** Any component button. */
export type AnyComponentButton = ComponentButton | ComponentButtonLink | ComponentButtonPremium;

/** A regular component button. */
export interface ComponentButton {
  /** The type of component to use. */
  type: ComponentType.BUTTON;
  /** The style of button to show. */
  style:
    | ButtonStyle.PRIMARY
    | ButtonStyle.SECONDARY
    | ButtonStyle.SUCCESS
    | ButtonStyle.DESTRUCTIVE
    | ButtonStyle.DANGER;
  /** The identifier for this button. */
  custom_id: string;
  /** The label of the button. */
  label?: string;
  /** The emoji to show inside the button. */
  emoji?: PartialEmoji;
  /** Whether this button will show as disabled. */
  disabled?: boolean;
}

/** A component button with a link. */
export interface ComponentButtonLink extends Omit<ComponentButton, 'custom_id' | 'style'> {
  /** The style of button to show. */
  style: ButtonStyle.LINK;
  /** The URL for link buttons. */
  url: string;
}

/** A component button with a premium sku. */
export interface ComponentButtonPremium extends Omit<ComponentButton, 'custom_id' | 'label' | 'emoji' | 'style'> {
  /** The style of button to show. */
  style: ButtonStyle.PREMIUM;
  /** The identifier for a purchasable SKU. */
  sku_id: string;
}

export interface ComponentSelectMenu {
  /** The type of component to use. */
  type:
    | ComponentType.STRING_SELECT
    | ComponentType.USER_SELECT
    | ComponentType.ROLE_SELECT
    | ComponentType.MENTIONABLE_SELECT
    | ComponentType.CHANNEL_SELECT;
  /** The identifier of the of the menu. */
  custom_id: string;
  /** The options to show inside this menu. Only used for string selects. */
  options?: ComponentSelectOption[];
  /** The string to show in absence of a selected option. */
  placeholder?: string;
  /** The minimum number of items to be chosen. */
  min_values?: number;
  /** The maximum number of items to be chosen. */
  max_values?: number;
  /** Whether this menu will show as disabled. */
  disabled?: boolean;
  /** An array of channel types this select can use. Only used for channel selects. */
  channel_types?: ChannelType[];
  /** An array of default values. */
  default_values?: SelectDefaultValue[];
}

export interface SelectDefaultValue {
  /** The ID of the object */
  id: string;
  /** The type that the ID represents. */
  type: 'user' | 'role' | 'channel';
}

export interface ComponentSelectOption {
  /** The description of this option. */
  description?: string;
  /** The emoji to show with the option. */
  emoji?: PartialEmoji;
  /** The label of this option. */
  label: string;
  /** The value of this option. */
  value: string;
  /** Should this render by default */
  default?: boolean;
}

export interface ComponentTextInput {
  /** The type of component to use. */
  type: ComponentType.TEXT_INPUT;
  /** The identifier of the of the input. */
  custom_id: string;
  /** The label of the input. */
  label: string;
  /** The style of the input. */
  style: TextInputStyle;
  /** The minimum length of the input. */
  min_length?: number;
  /** The maximum length of the input. */
  max_length?: number;
  /** Whether this component is required to be filled. */
  required?: boolean;
  /** A pre-filled value for this input. */
  value?: string;
  /** Custom placeholder text if the input is empty. */
  placeholder?: string;
}

/** An attachment from an interaction. */
export interface AttachmentData {
  /** The ID of the attachment. */
  id: string;
  /** The filename of the attachment. */
  filename: string;
  /** The description of the attachment. */
  description?: string;
  /** The content type of the attachment. */
  content_type?: string;
  /** The size of the attachment in bytes. */
  size: number;
  /** The URL of the attachment. */
  url: string;
  /** The proxy URL of the attachment. */
  proxy_url: string;
  /** Whether the attachment is ephemeral */
  ephermal?: boolean;

  /** The height of the attachment. */
  height?: number;
  /** The width of the attachment. */
  width?: number;

  /** The base64-encoded byte array of the voice messsage's waveform */
  waveform?: string;
  /** The duration of the voice message attachment in seconds */
  duration_secs?: number;
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
  STREAM: 'Video',
  VIEW_CHANNEL: 'Read messages and view channels',
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
  MANAGE_EMOJIS_AND_STICKERS: 'Manage expressions',
  MANAGE_GUILD_EXPRESSIONS: 'Manage expressions',
  USE_APPLICATION_COMMANDS: 'Use application commands',
  REQUEST_TO_SPEAK: 'Request to speak',
  MANAGE_EVENTS: 'Manage events',
  MANAGE_THREADS: 'Manage threads',
  USE_PUBLIC_THREADS: 'Create public threads',
  CREATE_PUBLIC_THREADS: 'Create public threads',
  USE_PRIVATE_THREADS: 'Create private threads',
  CREATE_PRIVATE_THREADS: 'Create private threads',
  USE_EXTERNAL_STICKERS: 'Use external stickers',
  SEND_MESSAGES_IN_THREADS: 'Send messages in threads',
  USE_EMBEDDED_ACTIVITIES: 'Use embedded activities',
  MODERATE_MEMBERS: 'Moderate members',
  VIEW_CREATOR_MONETIZATION_ANALYTICS: 'View creator monetization insights',
  USE_SOUNDBOARD: 'Use soundboard',
  USE_EXTERNAL_SOUNDS: 'Use external sounds',
  SEND_VOICE_MESSAGES: 'Send voice messages',
  SEND_POLLS: 'Create polls',
  USE_EXTERNAL_APPS: 'Use external apps'
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
  USER_AVATAR: (userID: string, userAvatar: string) => `/avatars/${userID}/${userAvatar}`,
  USER_AVATAR_DECORATION: (userID: string, userDecoration: string) => `/avatar-decorations/${userID}/${userDecoration}`,
  USER_AVATAR_DECORATION_PRESET: (userDecoration: string) => `/avatar-decoration-presets/${userDecoration}`,
  ROLE_ICON: (roleID: string, roleIcon: string) => `/role-icons/${roleID}/${roleIcon}`,
  GUILD_MEMBER_AVATAR: (guildID: string, memberID: string, memberAvatar: string) =>
    `/guilds/${guildID}/users/${memberID}/avatars/${memberAvatar}`
};

// BaseSlashCreator events for documentation.
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Emitted when Discord pings the interaction endpoint.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param user The user that requested the ping
 */
declare function ping(user?: CommandUser): void;
/**
 * Emitted when the creator successfully synced commands.
 * @event
 * @asMemberOf BaseSlashCreator
 */
declare function synced(): void;
/**
 * Emitted when the Client's RequestHandler receives a response.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param request The data for the request
 */
declare function rawREST(request: RawRequest): void;
/**
 * Emitted when a warning is given.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param warning The warning
 */
declare function warn(warning: Error | string): void;
/**
 * Emitted when a debug message is given.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param message The debug message
 */
declare function debug(message: string): void;
/**
 * Emitted when an error occurred
 * @event
 * @asMemberOf BaseSlashCreator
 * @param err The error thrown
 */
declare function error(err: Error): void;
/**
 * Emitted when a request failed to be verified.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param treq The unverified request
 */
declare function unverifiedRequest(treq: TransformedRequest): void;
/**
 * Emitted when an unknown interaction type is encountered.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param interaction The unhandled interaction
 */
declare function unknownInteraction(interaction: any): void;
/**
 * Emitted when any interaction is given.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param interaction The interaction
 */
declare function rawInteraction(interaction: AnyRequestData): void;
/**
 * Emitted when any request is recieved.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param treq The transformed request
 */
declare function rawRequest(treq: TransformedRequest): void;
/**
 * Emitted when a modal interaction is given.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param ctx The modal interaction context
 */
declare function modalInteraction(ctx: ModalInteractionContext): void;
/**
 * Emitted when a command interaction is given.
 * Only emits if `handleCommandsManually` in {@link SlashCreatorOptions} is true.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param interaction The interaction
 * @param respond The response callback to the interaction
 * @param webserverMode Whether this is from a webserver
 */
declare function commandInteraction(
  interaction: InteractionRequestData,
  respond: RespondFunction,
  webserverMode: boolean
): void;
/**
 * Emitted when a component interaction is given.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param ctx The component context
 */
declare function componentInteraction(ctx: ComponentContext): void;
/**
 * Emitted when a autocomplete interaction is given.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param ctx The autocomplete context
 * @param command The command that is being autocompleted
 */
declare function autocompleteInteraction(ctx: AutocompleteContext, command?: SlashCommand): void;
/**
 * Emitted when a command is registered.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param command Command that was registered
 * @param creator Creator that the command was registered to
 */
declare function commandRegister(command: SlashCommand, creator: BaseSlashCreator): void;
/**
 * Emitted when a command is unregistered
 * @event
 * @asMemberOf BaseSlashCreator
 * @param command Command that was unregistered
 */
declare function commandUnregister(command: SlashCommand): void;
/**
 * Emitted when a command is reregistered
 * @event
 * @asMemberOf BaseSlashCreator
 * @param newCommand New command
 * @param oldCommand Old command
 */
declare function commandReregister(command: SlashCommand, oldCommand: SlashCommand): void;
/**
 * Emitted when a command is blocked.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param command Command that was blocked
 * @param ctx The context of the interaction
 * @param reason Reason that the command was blocked
 * @param data Additional data associated with the block.
 */
declare function commandBlock(command: SlashCommand, ctx: CommandContext, reason: string, data: any): void;
/**
 * Emitted when a command gave an error.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param command Command that gave an error
 * @param err The error given
 * @param ctx The context of the interaction
 */
declare function commandError(command: SlashCommand, err: Error, ctx: CommandContext): void;
/**
 * Emitted when a command is ran.
 * @event
 * @asMemberOf BaseSlashCreator
 * @param command Command that was ran
 * @param promise Promise for the command result
 * @param ctx The context of the interaction
 */
declare function commandRun(command: SlashCommand, promise: Promise<any>, ctx: CommandContext): void;
