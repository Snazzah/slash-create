import {
  ComponentActionRow,
  ComponentTextInput,
  InteractionResponseType,
  ModalSubmitRequestData
} from '../../constants';
import { SlashCreator } from '../../creator';
import { RespondFunction } from '../../server';
import { MessageInteractionContext } from './messageInteraction';

/** Represents an interaction context from a modal submission. */
export class ModalInteractionContext extends MessageInteractionContext {
  /** The ID of the component to identify its origin from. */
  readonly customID: string;

  /** The values defined in the modal submission. */
  readonly values: { [key: string]: string };

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data for the context.
   * @param respond The response function for the interaction.
   * @param useTimeout Whether to use the deferral timeout.
   */
  constructor(creator: SlashCreator, data: ModalSubmitRequestData, respond: RespondFunction, useTimeout = true) {
    super(creator, data, respond);

    this.customID = data.data.custom_id;
    this.values = ModalInteractionContext.convertComponents(data.data.components);

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
}
