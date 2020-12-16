import Member from './structures/member';
import { RespondFunction } from './server';
import SlashCreator from './creator';
import {
  CommandOption,
  Endpoints,
  InteractionRequestData,
  InteractionResponseFlags,
  InterationResponseType
} from './constants';
import { formatAllowedMentions, FormattedAllowedMentions, MessageAllowedMentions } from './util';

type ConvertedOption = { [key: string]: ConvertedOption } | string | number | boolean;

interface MessageOptions {
  tts?: boolean;
  content?: string;
  // @TODO embed typings
  embeds?: any[];
  allowedMentions?: MessageAllowedMentions;
  flags?: number;
  /**
   * Whether or not the message should be ephemeral.
   * Ignored if `flags` is defined.
   */
  ephemeral?: boolean;
  /** Whether or not to include the source of the interaction in the message. */
  includeSource?: boolean;
}

class CommandContext {
  readonly creator: SlashCreator;
  readonly data: InteractionRequestData;
  readonly interactionToken: string;
  readonly interactionID: string;
  readonly channelID: string;
  readonly guildID: string;
  readonly member: Member;
  readonly commandName: string;
  readonly commandID: string;
  readonly options?: { [key: string]: ConvertedOption };
  readonly invokedAt: number = Date.now();
  initiallyResponded = false;
  initialResponseDeleted = false;

  private _respond: RespondFunction;

  constructor(creator: SlashCreator, data: InteractionRequestData, respond: RespondFunction) {
    this.creator = creator;
    this.data = data;
    this._respond = respond;

    this.interactionToken = data.token;
    this.interactionID = data.id;
    this.channelID = data.channel_id;
    this.guildID = data.guild_id;
    this.member = new Member(data.member, this.creator);

    this.commandName = data.data.name;
    this.commandID = data.data.id;
    if (data.data.options) this.options = CommandContext.convertOptions(data.data.options);
  }

  // https://get.snaz.in/AFLrDBa.png

  /**
   * Sends a message, if it already made an initial response, this will create a follow-up message.
   * Note that when making a follow-up message, the `ephemeral` and `includeSource` are ignored.
   * @param content The content of the message
   * @param options The message options
   */
  async send(content: string | MessageOptions, options?: MessageOptions): Promise<boolean | any> {
    if (typeof content !== 'string') options = content;
    else if (typeof options !== 'object') options = {};

    if (typeof options !== 'object') throw new Error('Message options is not an object.');

    if (!options.content) options.content = content as string;

    if (!options.content && !options.embeds) throw new Error('Message content and embeds are both not given.');

    if (options.ephemeral && !options.flags) options.flags = InteractionResponseFlags.EPHEMERAL;

    const allowedMentions = options.allowedMentions
      ? formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions as FormattedAllowedMentions)
      : this.creator.allowedMentions;

    if (!this.initiallyResponded) {
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
      this.initiallyResponded = true;
      return true;
    } else
      return this.creator.requestHandler.request(
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
  }

  /**
   * Deletes a message. If the message ID was not defined, the original message is used.
   * @param content The content of the message
   * @param options The message options
   */
  delete(messageID?: string) {
    return this.creator.requestHandler.request(
      'DELETE',
      Endpoints.MESSAGE(this.creator.options.applicationID, this.interactionToken, messageID)
    );
  }

  /**
   * Acknowleges the interaction. Including source will send a message showing only the source.
   * @param includeSource Whether to include the source in the acknolegement.
   * @returns Whether the acknowledgement passed
   */
  async acknowledge(includeSource = false): Promise<boolean> {
    if (!this.initiallyResponded) {
      await this._respond({
        status: 200,
        body: {
          type: includeSource ? InterationResponseType.ACKNOWLEDGE_WITH_SOURCE : InterationResponseType.ACKNOWLEDGE
        }
      });
      this.initiallyResponded = true;
      return true;
    }

    return false;
  }

  /** @private */
  static convertOptions(options: CommandOption[]) {
    const convertedOptions: { [key: string]: ConvertedOption } = {};
    for (const option of options) {
      if (option.options) convertedOptions[option.name] = CommandContext.convertOptions(option.options);
      else if (option.value) convertedOptions[option.name] = option.value;
    }
    return convertedOptions;
  }
}

export default CommandContext;
