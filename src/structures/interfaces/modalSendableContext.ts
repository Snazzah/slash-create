import { ComponentActionRow, InteractionResponseType } from '../../constants';
import { ModalRegisterCallback, SlashCreator } from '../../creator';
import { RespondFunction } from '../../server';
import { generateID } from '../../util';
import { MessageInteractionContext } from './messageInteraction';

/** Represents an interaction tha can send modals. */
export class ModalSendableContext extends MessageInteractionContext {
  constructor(creator: SlashCreator, data: any, respond: RespondFunction) {
    super(creator, data, respond);
  }

  /**
   * Sends a modal to the user.
   * If a callback is not defined, you are required to provide a custom ID in the options.
   * If a callback is defined, a custom ID will be generated if not defined.
   * @param options The message options
   * @param callback The callback of the modal
   * @returns The custom ID of the modal
   */
  async sendModal(options: ModalOptions, callback?: ModalRegisterCallback): Promise<string> {
    if (this.expired) throw new Error('This interaction has expired');
    if (this.initiallyResponded) throw new Error('This interaction has already responded.');

    if (callback) {
      if (!options.custom_id) options.custom_id = generateID();

      const key = `${this.user.id}-${options.custom_id}`;

      this.creator._modalCallbacks.set(key, {
        callback,
        expires: this.invokedAt + 1000 * 60 * 15
      });
    } else if (!callback && !options.custom_id)
      throw new Error('Modal must have a custom_id if no callback is provided');

    this.initiallyResponded = true;
    clearTimeout(this._timeout);
    await this._respond({
      status: 200,
      body: {
        type: InteractionResponseType.MODAL,
        data: options
      }
    });

    return options.custom_id!;
  }
}

export interface ModalOptions {
  /** The title of the modal */
  title: string;
  /** The custom ID of the modal. If a callback is provided but not a custom ID, one will be generated and returned. */
  custom_id?: string;
  /** The components of the modal. */
  components: ComponentActionRow[];
}
