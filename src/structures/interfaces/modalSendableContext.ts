import {
  ComponentActionRow,
  InteractionResponseType,
  ModalRegisterCallback,
  RespondFunction,
  SlashCreator
} from '../..';
import { generateID } from '../../util';
import { MessageInteractionContext } from './messageInteraction';

export class ModalSendableContext extends MessageInteractionContext {
  constructor(creator: SlashCreator, data: any, respond: RespondFunction) {
    super(creator, data, respond);
  }

  sendModal(payload: ModalOptions, callback?: ModalRegisterCallback): string {
    if (this.expired) throw new Error('This interaction has expired');
    if (this.initiallyResponded) throw new Error('This interaction has already responded.');

    this._respond({
      status: 200,
      body: {
        type: InteractionResponseType.MODAL,
        data: payload
      }
    });

    if (callback) {
      if (!payload.custom_id) {
        payload.custom_id = generateID();
      }

      const key = `${this.user.id}-${payload.custom_id}`;

      this.creator._modalCallbacks.set(key, {
        callback,
        expires: this.invokedAt + 1000 * 60 * 15
      });
    } else if (!callback && !payload.custom_id) {
      throw new Error('Modal must have a custom_id if no callback is provided');
    }

    return payload.custom_id!;
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
