import {
  ComponentType,
  InitialInteractionResponse,
  InteractionResponseType,
  MessageComponentRequestData
} from '../../constants';
import { EditMessageOptions } from './messageInteraction';
import { BaseSlashCreator } from '../../creator';
import { RespondFunction } from '../../server';
import { Message } from '../message';
import { convertCallbackResponse, formatAllowedMentions, FormattedAllowedMentions } from '../../util';
import { ModalSendableContext } from './modalSendableContext';

/** Represents an interaction context from a message component. */
export class ComponentContext<ServerContext extends any = unknown> extends ModalSendableContext<ServerContext> {
  /** The request data. */
  readonly data: MessageComponentRequestData;

  /** The ID of the component to identify its origin from. */
  readonly customID: string;
  /** The type of component this interaction came from. */
  readonly componentType: ComponentType;
  /** The the values of the interaction, if the component was a SELECT. */
  readonly values: string[];
  /** The message this interaction came from, will be partial for ephemeral messages. */
  readonly message: Message;

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data for the context.
   * @param respond The response function for the interaction.
   * @param useTimeout Whether to use the acknowledgement timeout.
   * @param serverContext The context of the server.
   */
  constructor(
    creator: BaseSlashCreator,
    data: MessageComponentRequestData,
    respond: RespondFunction,
    useTimeout = true,
    serverContext: ServerContext
  ) {
    super(creator, data, respond, serverContext);
    this.data = data;

    this.customID = data.data.custom_id;
    this.componentType = data.data.component_type;
    this.values = data.data.values || [];
    this.message = new Message(data.message, creator, this);

    // Auto-acknowledge if no response was given in 2 seconds
    if (useTimeout) this._timeout = setTimeout(() => this.acknowledge(), 2000);
  }

  /**
   * Acknowledges the interaction without replying.
   * @returns Whether the acknowledgement passed or the callback response if available
   */
  async acknowledge(): Promise<boolean | InitialInteractionResponse> {
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
   * This will return `true` or a {@link InitialInteractionResponse} if it's an initial response, otherwise a {@link Message} will be returned.
   * @param content The content of the message
   * @returns `true` or a {@link InitialInteractionResponse} if the initial response passed, otherwise a {@link Message} of the parent message.
   */
  async editParent(content: string | EditMessageOptions): Promise<boolean | InitialInteractionResponse | Message> {
    if (this.expired) throw new Error('This interaction has expired');

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
            allowed_mentions: allowedMentions,
            components: options.components
          }
        },
        files: options.files
      });
      return response ? convertCallbackResponse(response, this) : true;
    } else return this.edit(this.message.id, content);
  }
}
