import { ComponentType, InteractionResponseType, MessageComponentRequestData, PartialMessage } from '../../constants';
import MessageInteractionContext from './messageInteraction';
import SlashCreator from '../../creator';
import { RespondFunction } from '../../server';

/** Represents an interaction context from a message component. */
class ComponentContext extends MessageInteractionContext {
  /** The request data. */
  readonly data: MessageComponentRequestData;

  /** The ID of the component to identify its origin from. */
  readonly customID: string;
  /** The type of component this interaction came from. */
  readonly componentType: ComponentType;
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
}

export default ComponentContext;
