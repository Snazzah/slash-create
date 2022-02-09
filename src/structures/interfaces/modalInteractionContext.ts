import { ComponentActionRow, ComponentTextInput, ModalSubmitRequestData } from '../../constants';
import { SlashCreator } from '../../creator';
import { RespondFunction } from '../../server';
import { MessageInteractionContext } from './messageInteraction';

/** Represents an interaction context from a modal submission. */
export class ModalInteractionContext extends MessageInteractionContext {
  /** The ID of the component to identify its origin from. */
  readonly customID: string;

  /** The values defined in the modal submission. */
  readonly values: { [key: string]: string };

  constructor(creator: SlashCreator, data: ModalSubmitRequestData, respond: RespondFunction) {
    super(creator, data, respond);

    this.customID = data.data.custom_id;
    this.values = ModalInteractionContext.convertComponents(data.data.components);
  }

  static convertComponents(components: ComponentActionRow[]): { [key: string]: string } {
    const values: { [key: string]: string } = {};

    for (const row of components) {
      const component = row.components[0] as ComponentTextInput;

      values[component.custom_id] = component.value!;
    }

    return values;
  }
}
