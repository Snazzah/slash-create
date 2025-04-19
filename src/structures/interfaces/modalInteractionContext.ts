import {
  AnyComponent,
  ComponentTextInput,
  ComponentType,
  InitialCallbackResponse,
  InteractionResponseType,
  ModalSubmitRequestData
} from '../../constants';
import { BaseSlashCreator } from '../../creator';
import { RespondFunction } from '../../server';
import { convertCallbackResponse, formatAllowedMentions, FormattedAllowedMentions } from '../../util';
import { Message } from '../message';
import { EditMessageOptions, MessageInteractionContext } from './messageInteraction';

/** Represents an interaction context from a modal submission. */
export class ModalInteractionContext<
  ServerContext extends any = unknown
> extends MessageInteractionContext<ServerContext> {
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
   * @param serverContext The context of the server.
   */
  constructor(
    creator: BaseSlashCreator,
    data: ModalSubmitRequestData,
    respond: RespondFunction,
    useTimeout = true,
    serverContext: ServerContext
  ) {
    super(creator, data, respond, serverContext);

    this.data = data;
    this.customID = data.data.custom_id;
    this.values = ModalInteractionContext.convertComponents(data.data.components);

    if (data.message) this.message = new Message(data.message, creator, this);
    // Auto-defer if no response was given in 2 seconds
    if (useTimeout) this._timeout = setTimeout(() => this.defer(false), 2000);
  }

  static convertComponents(components: AnyComponent[]): { [key: string]: string } {
    const values: { [key: string]: string } = {};

    // TODO If/when selects are available in modals, this needs to adapt for that change
    for (const component of components) {
      if (component.type === ComponentType.TEXT_INPUT) {
        values[component.custom_id] = component.value!;
        continue;
      }

      if (component.type !== ComponentType.ACTION_ROW) continue;
      const childComponent = component.components[0] as ComponentTextInput;

      values[childComponent.custom_id] = childComponent.value!;
    }

    return values;
  }

  /**
   * Acknowledges the interaction without replying.
   * @returns Whether the acknowledgement passed or the callback response if available
   */
  async acknowledge(): Promise<boolean | InitialCallbackResponse> {
    if (!this.initiallyResponded) {
      this.initiallyResponded = true;
      clearTimeout(this._timeout);
      const response = await this._respond({
        status: 200,
        body: {
          type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        }
      });
      return response ? convertCallbackResponse(response, this) : true;
    }

    return false;
  }

  /**
   * Edits the message that the component interaction came from.
   * This will return `true` or a {@link InitialCallbackResponse} if it's an initial response, otherwise a {@link Message} will be returned.
   * @param content The content of the message
   * @returns `true` or a {@link InitialCallbackResponse} if the initial response passed, otherwise a {@link Message} of the parent message.
   */
  async editParent(content: string | EditMessageOptions): Promise<true | InitialCallbackResponse | Message> {
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
      const response = await this._respond({
        status: 200,
        body: {
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            content: options.content,
            embeds: options.embeds,
            flags: options.flags,
            allowed_mentions: allowedMentions,
            components: options.components,
            attachments: options.attachments
          }
        },
        files: options.files
      });
      return response ? convertCallbackResponse(response, this) : true;
    } else return this.edit(this.message.id, content);
  }
}
