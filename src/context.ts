import Member from './structures/member';
import { RespondFunction } from './server';
import SlashCreator from './creator';
import {
  AnyCommandOption,
  Endpoints,
  InteractionRequestData,
  InteractionResponseFlags,
  InterationResponseType
} from './constants';
import { formatAllowedMentions, FormattedAllowedMentions, MessageAllowedMentions } from './util';
import Message from './structures/message';

/** Command options converted for ease of use. */
export type ConvertedOption = { [key: string]: ConvertedOption } | string | number | boolean;

/** The options for {@link CommandContext#edit}. */
export interface EditMessageOptions {
  /** The message content. */
  content?: string;
  /** The embeds of the message. */
  embeds?: any[];
  /** The mentions allowed to be used in this message. */
  allowedMentions?: MessageAllowedMentions;
}

/** The options for {@link CommandContext#sendFollowUp}. */
interface FollowUpMessageOptions extends EditMessageOptions {
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
  /** Whether or not to include the source of the interaction in the message. */
  includeSource?: boolean;
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
  readonly guildID: string;
  /** The member that invoked the command. */
  readonly member: Member;
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
  /** Whether the initial response was made. */
  initiallyResponded = false;

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
   */
  constructor(creator: SlashCreator, data: InteractionRequestData, respond: RespondFunction, webserverMode: boolean) {
    this.creator = creator;
    this.data = data;
    this.webserverMode = webserverMode;
    this._respond = respond;

    this.interactionToken = data.token;
    this.interactionID = data.id;
    this.channelID = data.channel_id;
    this.guildID = data.guild_id;
    this.member = new Member(data.member, this.creator);

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
          type: options.includeSource
            ? InterationResponseType.CHANNEL_MESSAGE_WITH_SOURCE
            : InterationResponseType.CHANNEL_MESSAGE,
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
    } else return this.sendFollowUp(content, options);
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
        allowed_mentions: allowedMentions
      }
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
        allowed_mentions: allowedMentions
      }
    );
    return new Message(data, this);
  }

  /**
   * Edits the original message.
   * This is put on a timeout of 150 ms for webservers to account for
   * Discord recieving and processing the original response.
   * Note: This will error with ephemeral messages or acknowledgements.
   * @param content The content of the message
   * @param options The message options
   */
  editOriginal(content: string | EditMessageOptions, options?: EditMessageOptions) {
    if (!this.webserverMode) return this.edit('@original', content, options);
    return new Promise((resolve, reject) =>
      setTimeout(() => this.edit('@original', content, options).then(resolve).catch(reject), 150)
    );
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
   * Acknowleges the interaction. Including source will send a message showing only the source.
   * @param includeSource Whether to include the source in the acknowledgement.
   * @returns Whether the acknowledgement passed
   */
  async acknowledge(includeSource = false): Promise<boolean> {
    if (!this.initiallyResponded) {
      this.initiallyResponded = true;
      clearTimeout(this._timeout);
      await this._respond({
        status: 200,
        body: {
          type: includeSource ? InterationResponseType.ACKNOWLEDGE_WITH_SOURCE : InterationResponseType.ACKNOWLEDGE
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
      if ('options' in option) convertedOptions[option.name] = CommandContext.convertOptions(option.options);
      else convertedOptions[option.name] = option.value !== undefined ? option.value : {};
    }
    return convertedOptions;
  }

  /** @private */
  static getSubcommandArray(options: AnyCommandOption[]) {
    const result: string[] = [];
    for (const option of options) {
      if ('options' in option) result.push(option.name, ...CommandContext.getSubcommandArray(option.options));
      else if (option.value === undefined && option.name) result.push(option.name);
    }
    return result;
  }
}

export default CommandContext;
