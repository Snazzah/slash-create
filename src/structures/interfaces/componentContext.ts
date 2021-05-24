import { MessageComponentRequestData } from '../../constants';
import MessageInteractionContext from './messageInteraction';
import SlashCreator from '../../creator';
import { RespondFunction } from '../../server';

/** Represents an interaction context from a message component. */
class ComponentContext extends MessageInteractionContext {
  /** The request data. */
  readonly data: MessageComponentRequestData;
  /** The timeout for the auto-response. */
  private _timeout?: any;

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data for the context.
   * @param respond The response function for the interaction.
   */
  constructor(creator: SlashCreator, data: MessageComponentRequestData, respond: RespondFunction) {
    super(creator, data, respond);
    this.data = data;
  }

  /**
   * Acknowledges the interaction without replying.
   * @param ephemeral Whether to make the deferred message ephemeral.
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
          type: 6
        }
      });
      return true;
    }

    return false;
  }
}

export default ComponentContext;
