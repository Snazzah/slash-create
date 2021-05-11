import Member from './structures/member';
import { RespondFunction } from './server';
import SlashCreator from './creator';
import {
  AnyCommandOption,
  ComponentActionRow,
  Endpoints,
  InteractionRequestData,
  InteractionResponseFlags,
  InterationResponseType
} from './constants';
import { formatAllowedMentions, FormattedAllowedMentions, MessageAllowedMentions } from './util';
import Message, { MessageEmbedOptions } from './structures/message';
import User from './structures/user';
import Collection from '@discordjs/collection';
import Channel from './structures/channel';
import Role from './structures/role';
import ResolvedMember from './structures/resolvedMember';

/** Command options converted for ease of use. */
export type ConvertedOption = { [key: string]: ConvertedOption } | string | number | boolean;

/** The options for {@link CommandContext#edit}. */
export interface EditMessageOptions {
  /** The message content. */
  content?: string;
  /** The embeds of the message. */
  embeds?: MessageEmbedOptions[];
  /** The mentions allowed to be used in this message. */
  allowedMentions?: MessageAllowedMentions;
  /**
   * The attachment(s) to send with the message.
   * Note that ephemeral messages and initial messages cannot have
   * attachments.
   */
  file?: MessageFile | MessageFile[];
  /** The components of the message. */
  components?: ComponentActionRow[];
}

/** A file within {@link EditMessageOptions}. */
export interface MessageFile {
  /** The attachment to send. */
  file: Buffer;
  /** The name of the file. */
  name: string;
}

/** The options for {@link CommandContext#sendFollowUp}. */
export interface FollowUpMessageOptions extends EditMessageOptions {
  /** Whether to use TTS for the content. */
  tts?: boolean;
  /** The flags to use in the message. */
  flags?: number;
}

/** The options for {@link CommandContext#send}. */
export interface MessageOptions extends FollowUpMessageOptions {
  /**
   * Whether or not the message should be ephemeral.
   * Ignored if `flags` is defined.
   */
  ephemeral?: boolean;
}

/** Context representing a command interaction. */
class CommandContext {
  /** The creator of the command. */
  readonly creator: SlashCreator;
  /** The full interaction data. */
  readonly data: InteractionRequestData;
  /** The interaction's token. */
  readonly interactionToken: string;
  /** The interaction's ID. */
  readonly interactionID: string;
  /** The channel ID that the command was invoked in. */
  readonly channelID: string;
  /** The guild ID that the command was invoked in. */
  readonly guildID?: string;
  /** The member that invoked the command. */
  readonly member?: Member;
  /** The user that invoked the command. */
  readonly user: User;

  /** The command's name. */
  readonly commandName: string;
  /** The command's ID. */
  readonly commandID: string;
  /** The options given to the command. */
  readonly options: { [key: string]: ConvertedOption };
  /** The subcommands the member used in order. */
  readonly subcommands: string[];
  /** The time when the context was created. */
  readonly invokedAt: number = Date.now();
  /** Whether the initial response was sent. */
  initiallyResponded = false;
  /** Whether there is a deferred message available. */
  deferred = false;

  /** The resolved users of the interaction. */
  readonly users = new Collection<string, User>();
  /** The resolved members of the interaction. */
  readonly members = new Collection<string, ResolvedMember>();
  /** The resolved roles of the interaction. */
  readonly roles = new Collection<string, Role>();
  /** The resolved channels of the interaction. */
  readonly channels = new Collection<string, Channel>();

  /** Whether the context is from a webserver. */
  private webserverMode: boolean;
  /** The initial response function. */
  private _respond: RespondFunction;
  /** The timeout for the auto-response. */
  private _timeout?: any;

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data for the context.
   * @param respond The response function for the interaction.
   * @param webserverMode Whether the interaction was from a webserver.
   * @param deferEphemeral Whether the context should auto-defer ephemeral messages.
   */
  constructor(
    creator: SlashCreator,
    data: InteractionRequestData,
    respond: RespondFunction,
    webserverMode: boolean,
    deferEphemeral = false
  ) {
    this.creator = creator;
    this.data = data;
    this.webserverMode = webserverMode;
    this._respond = respond;

    this.interactionToken = data.token;
    this.interactionID = data.id;
    this.channelID = data.channel_id;
    this.guildID = 'guild_id' in data ? data.guild_id : undefined;
    this.member = 'guild_id' in data ? new Member(data.member, this.creator) : undefined;
    this.user = new User('guild_id' in data ? data.member.user : data.user, this.creator);

    this.commandName = data.data.name;
    this.commandID = data.data.id;
    this.options = data.data.options ? CommandContext.convertOptions(data.data.options) : {};
    this.subcommands = data.data.options ? CommandContext.getSubcommandArray(data.data.options) : [];

    if (data.data.resolved) {
      if (data.data.resolved.users)
        Object.keys(data.data.resolved.users).forEach((id) =>
          this.users.set(id, new User(data.data.resolved!.users![id], this.creator))
        );
      if (data.data.resolved.members)
        Object.keys(data.data.resolved.members).forEach((id) =>
          this.members.set(
            id,
            new ResolvedMember(data.data.resolved!.members![id], data.data.resolved!.users![id], this.creator)
          )
        );
      if (data.data.resolved.roles)
        Object.keys(data.data.resolved.roles).forEach((id) =>
          this.roles.set(id, new Role(data.data.resolved!.roles![id]))
        );
      if (data.data.resolved.channels)
        Object.keys(data.data.resolved.channels).forEach((id) =>
          this.channels.set(id, new Channel(data.data.resolved!.channels![id]))
        );
    }

    // Auto-defer if no response was given in 2 seconds
    this._timeout = setTimeout(() => this.defer(deferEphemeral || false), 2000);
  }

  /** Whether the interaction has expired. Interactions last 15 minutes. */
  get expired() {
    return this.invokedAt + 1000 * 60 * 15 < Date.now();
  }

  /**
   * Fetches a message.
   * @param messageID The ID of the message, defaults to the original message
   */
  async fetch(messageID = '@original') {
    const data = await this.creator.requestHandler.request(
      'GET',
      Endpoints.MESSAGE(this.creator.options.applicationID, this.interactionToken, messageID)
    );
    return new Message(data, this);
  }

  /**
   * Sends a message, if it already made an initial response, this will create a follow-up message.
   * IF the context has created a deferred message, it will edit that deferred message,
   * and future calls to this function create follow ups.
   * This will return a boolean if it's an initial response, otherwise a {@link Message} will be returned.
   * Note that when making a follow-up message, the `ephemeral` option is ignored.
   * @param content The content of the message
   * @param options The message options
   */
  async send(content: string | MessageOptions, options?: MessageOptions): Promise<boolean | Message> {
    if (this.expired) throw new Error('This interaction has expired');

    if (typeof content !== 'string') options = content;
    else if (typeof options !== 'object') options = {};

    if (typeof options !== 'object') throw new Error('Message options is not an object.');

    if (!options.content && typeof content === 'string') options.content = content;

    if (!options.content && !options.embeds) throw new Error('Message content and embeds are both not given.');

    if (options.ephemeral && !options.flags) options.flags = InteractionResponseFlags.EPHEMERAL;

    const allowedMentions = options.allowedMentions
      ? formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions as FormattedAllowedMentions)
      : this.creator.allowedMentions;

    if (!this.initiallyResponded) {
      this.initiallyResponded = true;
      clearTimeout(this._timeout);
      await this._respond({
        status: 200,
        body: {
          type: InterationResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            tts: options.tts,
            content: options.content,
            embeds: options.embeds,
            flags: options.flags,
            allowed_mentions: allowedMentions,
            components: options.components
          }
        }
      });
      return true;
    } else if (this.initiallyResponded && this.deferred) return this.editOriginal(content, options);
    else return this.sendFollowUp(content, options);
  }

  /**
   * Sends a follow-up message.
   * @param content The content of the message
   * @param options The message options
   */
  async sendFollowUp(content: string | FollowUpMessageOptions, options?: FollowUpMessageOptions): Promise<Message> {
    if (this.expired) throw new Error('This interaction has expired');

    if (typeof content !== 'string') options = content;
    else if (typeof options !== 'object') options = {};

    if (typeof options !== 'object') throw new Error('Message options is not an object.');

    if (!options.content && typeof content === 'string') options.content = content;

    if (!options.content && !options.embeds) throw new Error('Message content and embeds are both not given.');

    const allowedMentions = options.allowedMentions
      ? formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions as FormattedAllowedMentions)
      : this.creator.allowedMentions;

    const data = await this.creator.requestHandler.request(
      'POST',
      Endpoints.FOLLOWUP_MESSAGE(this.creator.options.applicationID, this.interactionToken),
      true,
      {
        tts: options.tts,
        content: options.content,
        embeds: options.embeds,
        allowed_mentions: allowedMentions,
        components: options.components
      },
      options.file
    );
    return new Message(data, this);
  }

  /**
   * Edits a message.
   * @param messageID The message's ID
   * @param content The content of the message
   * @param options The message options
   */
  async edit(messageID: string, content: string | EditMessageOptions, options?: EditMessageOptions) {
    if (this.expired) throw new Error('This interaction has expired');

    if (typeof content !== 'string') options = content;
    else if (typeof options !== 'object') options = {};

    if (typeof options !== 'object') throw new Error('Message options is not an object.');

    if (!options.content && typeof content === 'string') options.content = content;

    if (!options.content && !options.embeds && !options.allowedMentions)
      throw new Error('No valid options were given.');

    const allowedMentions = options.allowedMentions
      ? formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions as FormattedAllowedMentions)
      : this.creator.allowedMentions;

    const data = await this.creator.requestHandler.request(
      'PATCH',
      Endpoints.MESSAGE(this.creator.options.applicationID, this.interactionToken, messageID),
      true,
      {
        content: options.content,
        embeds: options.embeds,
        allowed_mentions: allowedMentions,
        components: options.components
      },
      options.file
    );
    return new Message(data, this);
  }

  /**
   * Edits the original message.
   * Note: This will error with ephemeral messages or deferred ephemeral messages.
   * @param content The content of the message
   * @param options The message options
   */
  editOriginal(content: string | EditMessageOptions, options?: EditMessageOptions): Promise<Message> {
    this.deferred = false;
    return this.edit('@original', content, options);
  }

  /**
   * Deletes a message. If the message ID was not defined, the original message is used.
   * @param messageID The message's ID
   */
  async delete(messageID?: string) {
    if (this.expired) throw new Error('This interaction has expired');

    return this.creator.requestHandler.request(
      'DELETE',
      Endpoints.MESSAGE(this.creator.options.applicationID, this.interactionToken, messageID)
    );
  }

  /**
   * Creates a deferred message. To users, this will show as
   * "Bot is thinking..." until the deferred message is edited.
   * @param ephemeral Whether to make the deferred message ephemeral.
   * @returns Whether the deferred message passed
   */
  async defer(ephemeral = false): Promise<boolean> {
    if (!this.initiallyResponded && !this.deferred) {
      this.initiallyResponded = true;
      this.deferred = true;
      clearTimeout(this._timeout);
      await this._respond({
        status: 200,
        body: {
          type: InterationResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: ephemeral ? InteractionResponseFlags.EPHEMERAL : 0
          }
        }
      });
      return true;
    }

    return false;
  }

  /** @private */
  static convertOptions(options: AnyCommandOption[]) {
    const convertedOptions: { [key: string]: ConvertedOption } = {};
    for (const option of options) {
      if ('options' in option)
        convertedOptions[option.name] = option.options ? CommandContext.convertOptions(option.options) : {};
      else convertedOptions[option.name] = 'value' in option && option.value !== undefined ? option.value : {};
    }
    return convertedOptions;
  }

  /** @private */
  static getSubcommandArray(options: AnyCommandOption[]) {
    const result: string[] = [];
    for (const option of options) {
      if ('options' in option || !('value' in option))
        result.push(option.name, ...(option.options ? CommandContext.getSubcommandArray(option.options) : []));
    }
    return result;
  }
}

export default CommandContext;
