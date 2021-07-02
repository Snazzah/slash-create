import { ComponentType, InteractionResponseType, MessageComponentRequestData, PartialMessage } from '../../constants';
import MessageInteractionContext, { EditMessageOptions } from './messageInteraction';
import SlashCreator from '../../creator';
import { RespondFunction } from '../../server';
import Message from '../message';
import { formatAllowedMentions, FormattedAllowedMentions } from '../../util';

/** Represents an interaction context from a message component. */
class ComponentContext extends MessageInteractionContext {
  /** The request data. */
  readonly data: MessageComponentRequestData;

  /** The ID of the component to identify its origin from. */
  readonly customID: string;
  /** The type of component this interaction came from. */
  readonly componentType: ComponentType;
  /** The the values of the interaction, if the component was a SELECT. */
  readonly values: string[];
  /** The partial message this interaction came from. */
  readonly message: PartialMessage;

  /** @hidden */
  private _timeout?: any;

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data for the context.
   * @param respond The response function for the interaction.
   */
  constructor(creator: SlashCreator, data: MessageComponentRequestData, respond: RespondFunction) {
    super(creator, data, respond);
    this.data = data;

    this.customID = data.data.custom_id;
    this.componentType = data.data.component_type;
    this.values = data.data.values || [];
    this.message = data.message;

    // Auto-acknowledge if no response was given in 2 seconds
    this._timeout = setTimeout(() => this.acknowledge(), 2000);
  }

  /**
   * Acknowledges the interaction without replying.
   * @returns Whether the acknowledgement passed passed
   */
  async acknowledge(): Promise<boolean> {
    if (!this.initiallyResponded) {
      this.initiallyResponded = true;
      clearTimeout(this._timeout);
      // @ts-expect-error
      await this._respond({
        status: 200,
        body: {
          type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        }
      });
      return true;
    }

    return false;
  }

  /**
   * Edits the message that the component interaction came from.
   * This will return a boolean if it's an initial response, otherwise a {@link Message} will be returned.
   * @param content The content of the message
   * @param options The message options
   */
  async editParent(content: string | EditMessageOptions, options?: EditMessageOptions): Promise<boolean | Message> {
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

    if (!this.initiallyResponded) {
      this.initiallyResponded = true;
      clearTimeout(this._timeout);
      // @ts-expect-error
      await this._respond({
        status: 200,
        body: {
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            content: options.content,
            embeds: options.embeds,
            allowed_mentions: allowedMentions,
            components: options.components
          }
        }
      });
      return true;
    } else return this.edit(this.message.id, content, options);
  }
}

export default ComponentContext;
