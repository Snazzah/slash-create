import {
  ComponentActionRow,
  ComponentTextInput,
  InteractionResponseType,
  ModalSubmitRequestData
} from '../../constants';
import { BaseSlashCreator } from '../../creator';
import { RespondFunction } from '../../server';
import { formatAllowedMentions, FormattedAllowedMentions } from '../../util';
import { Message } from '../message';
import { EditMessageOptions, MessageInteractionContext } from './messageInteraction';

/** Represents an interaction context from a modal submission. */
export class ModalInteractionContext extends MessageInteractionContext {
  /** The request data. */
  readonly data: ModalSubmitRequestData;
  /** The ID of the component to identify its origin from. */
  readonly customID: string;
  /** The message this interaction came from, will be partial for ephemeral messages. */
  readonly message?: Message;

  /** The values defined in the modal submission. */
  readonly values: { [key: string]: string };

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data for the context.
   * @param respond The response function for the interaction.
   * @param useTimeout Whether to use the deferral timeout.
   */
  constructor(creator: BaseSlashCreator, data: ModalSubmitRequestData, respond: RespondFunction, useTimeout = true) {
    super(creator, data, respond);

    this.data = data;
    this.customID = data.data.custom_id;
    this.values = ModalInteractionContext.convertComponents(data.data.components);

    if (data.message) this.message = new Message(data.message, creator, this);
    // Auto-defer if no response was given in 2 seconds
    if (useTimeout) this._timeout = setTimeout(() => this.defer(false), 2000);
  }

  static convertComponents(components: ComponentActionRow[]): { [key: string]: string } {
    const values: { [key: string]: string } = {};

    for (const row of components) {
      const component = row.components[0] as ComponentTextInput;

      values[component.custom_id] = component.value!;
    }

    return values;
  }

  /**
   * Acknowledges the interaction without replying.
   * @returns Whether the acknowledgement passed
   */
  async acknowledge(): Promise<boolean> {
    if (!this.initiallyResponded) {
      this.initiallyResponded = true;
      clearTimeout(this._timeout);
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

  /*
   * Edits the message that the component interaction came from.
   * This will return a boolean if it's an initial response, otherwise a {@link Message} will be returned.
   * @param content The content of the message
   */
  async editParent(content: string | EditMessageOptions): Promise<boolean | Message> {
    if (this.expired) throw new Error('This interaction has expired');
    if (!this.message) throw new Error('This interaction has no message');

    const options = typeof content === 'string' ? { content } : content;
    if (typeof options !== 'object') throw new Error('Message options is not an object.');
    if (!options.content && !options.embeds && !options.components && !options.files && !options.attachments)
      throw new Error('No valid options were given.');

    const allowedMentions = options.allowedMentions
      ? formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions as FormattedAllowedMentions)
      : this.creator.allowedMentions;

    if (!this.initiallyResponded) {
      this.initiallyResponded = true;
      clearTimeout(this._timeout);
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
        },
        files: options.files
      });
      return true;
    } else return this.edit(this.message.id, content);
  }
}
