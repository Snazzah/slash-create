import {
  ComponentActionRow,
  InitialCallbackResponse,
  InteractionResponseType,
  LabelComponent,
  TextDisplayComponent
} from '../../constants';
import { ModalRegisterCallback, BaseSlashCreator } from '../../creator';
import { RespondFunction } from '../../server';
import { convertCallbackResponse, generateID } from '../../util';
import { MessageInteractionContext } from './messageInteraction';

/** Represents an interaction that can send modals. */
export class ModalSendableContext<
  ServerContext extends any = unknown
> extends MessageInteractionContext<ServerContext> {
  constructor(creator: BaseSlashCreator, data: any, respond: RespondFunction, serverContext: ServerContext) {
    super(creator, data, respond, serverContext);
  }

  /**
   * Sends a modal to the user.
   * If a callback is not defined, you are required to provide a custom ID in the options.
   * If a callback is defined, a custom ID will be generated if not defined.
   * @param options The message options
   * @param callback The callback of the modal
   * @returns The custom ID of the modal and the callback response if available
   */
  async sendModal(
    options: ModalOptions,
    callback?: ModalRegisterCallback
  ): Promise<{
    customID: string;
    response: InitialCallbackResponse | null;
  }> {
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
    const response = await this._respond({
      status: 200,
      body: {
        type: InteractionResponseType.MODAL,
        data: options
      }
    });

    return {
      customID: options.custom_id!,
      response: response ? convertCallbackResponse(response, this) : null
    };
  }
}

export interface ModalOptions {
  /** The title of the modal */
  title: string;
  /** The custom ID of the modal. If a callback is provided but not a custom ID, one will be generated and returned. */
  custom_id?: string;
  /** The components of the modal. */
  components: (ComponentActionRow | LabelComponent | TextDisplayComponent)[];
}
