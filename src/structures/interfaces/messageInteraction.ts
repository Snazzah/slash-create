import { ComponentActionRow, InteractionResponseFlags, InteractionResponseType } from '../../constants';
import { BaseSlashCreator, ComponentRegisterCallback } from '../../creator';
import { RespondFunction } from '../../server';
import { formatAllowedMentions, FormattedAllowedMentions, MessageAllowedMentions } from '../../util';
import { Message, MessageEmbedOptions } from '../message';
import { BaseInteractionContext } from './baseInteraction';

/** Represents a interaction context that handles messages. */
export class MessageInteractionContext<
  ServerContext extends any = unknown
> extends BaseInteractionContext<ServerContext> {
  /** Whether the initial response was sent. */
  initiallyResponded = false;
  /** Whether there is a deferred message available. */
  deferred = false;
  /** The original message ID, automatically set when editing/fetching original message. */
  messageID?: string;
  /** @hidden */
  protected _respond: RespondFunction;
  /** @hidden */
  protected _timeout?: any;

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data.
   * @param respond The response function for the interaction.
   * @param serverContext The context of the server.
   */
  constructor(creator: BaseSlashCreator, data: any, respond: RespondFunction, serverContext: ServerContext) {
    super(creator, data, serverContext);
    this._respond = respond;
  }

  /**
   * Fetches a message.
   * @param messageID The ID of the message, defaults to the original message
   */
  async fetch(messageID = '@original'): Promise<Message> {
    const data = await this.creator.api.fetchInteractionMessage(
      this.creator.options.applicationID,
      this.interactionToken,
      messageID
    );

    if (messageID === '@original') this.messageID = data.id;

    return new Message(data, this.creator, this);
  }

  /**
   * Sends a message, if it already made an initial response, this will create a follow-up message.
   * IF the context has created a deferred message, it will edit that deferred message,
   * and future calls to this function create follow ups.
   * This will return a boolean if it's an initial response, otherwise a {@link Message} will be returned.
   * Note that when making a follow-up message, the `ephemeral` option is ignored.
   * @param content The content of the message
   */
  async send(content: string | MessageOptions): Promise<boolean | Message> {
    if (this.expired) throw new Error('This interaction has expired');

    const options = typeof content === 'string' ? { content } : content;
    if (typeof options !== 'object') throw new Error('Message options is not an object.');
    if (!options.content && !options.embeds && !options.files) throw new Error('No valid options were given.');
    if (options.ephemeral && !options.flags) options.flags = InteractionResponseFlags.EPHEMERAL;

    const allowedMentions = options.allowedMentions
      ? formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions as FormattedAllowedMentions)
      : this.creator.allowedMentions;

    if (!this.initiallyResponded) {
      this.initiallyResponded = true;
      clearTimeout(this._timeout);
      await this._respond({
        status: 200,
        body: {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            tts: options.tts,
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
      return true;
    } else if (this.initiallyResponded && this.deferred) return this.editOriginal(content);
    else return this.sendFollowUp(options);
  }

  /**
   * Sends a follow-up message.
   * @param content The content of the message
   */
  async sendFollowUp(content: string | MessageOptions): Promise<Message> {
    if (this.expired) throw new Error('This interaction has expired');

    const options = typeof content === 'string' ? { content } : content;
    if (typeof options !== 'object') throw new Error('Message options is not an object.');
    if (!options.content && !options.embeds && !options.files)
      throw new Error('Message content, embeds or files need to be given.');
    if (options.ephemeral && !options.flags) options.flags = InteractionResponseFlags.EPHEMERAL;

    const allowedMentions = options.allowedMentions
      ? formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions as FormattedAllowedMentions)
      : this.creator.allowedMentions;

    const data = await this.creator.api.followUpMessage(
      this.creator.options.applicationID,
      this.interactionToken,
      {
        tts: options.tts,
        content: options.content,
        embeds: options.embeds,
        allowed_mentions: allowedMentions,
        components: options.components,
        flags: options.flags,
        attachments: options.attachments
      },
      options.files
    );
    return new Message(data, this.creator, this);
  }

  /**
   * Edits a message.
   * @param messageID The message's ID
   * @param content The content of the message
   */
  async edit(messageID: string, content: string | EditMessageOptions): Promise<Message> {
    if (this.expired) throw new Error('This interaction has expired');

    const options = typeof content === 'string' ? { content } : content;
    if (typeof options !== 'object') throw new Error('Message options is not an object.');
    if (!options.content && !options.embeds && !options.components && !options.files && !options.attachments)
      throw new Error('No valid options were given.');

    const allowedMentions = options.allowedMentions
      ? formatAllowedMentions(options.allowedMentions, this.creator.allowedMentions as FormattedAllowedMentions)
      : this.creator.allowedMentions;

    const data = await this.creator.api.updateInteractionMessage(
      this.creator.options.applicationID,
      this.interactionToken,
      messageID,
      {
        content: options.content,
        embeds: options.embeds,
        allowed_mentions: allowedMentions,
        components: options.components,
        attachments: options.attachments
      },
      options.files
    );
    return new Message(data, this.creator, this);
  }

  /**
   * Edits the original message.
   * Note: This will error with ephemeral messages or deferred ephemeral messages.
   * @param content The content of the message
   * @param options The message options
   */
  async editOriginal(content: string | EditMessageOptions): Promise<Message> {
    this.deferred = false;
    const message = await this.edit('@original', content);
    this.messageID = message.id;
    return message;
  }

  /**
   * Deletes a message. If the message ID was not defined, the original message is used.
   * @param messageID The message's ID
   */
  async delete(messageID?: string) {
    if (this.expired) throw new Error('This interaction has expired');

    await this.creator.api.deleteInteractionMessage(
      this.creator.options.applicationID,
      this.interactionToken,
      messageID
    );
    if (!messageID || messageID === '@original') this.messageID = undefined;
  }

  /**
   * Creates a deferred message. To users, this will show as
   * "Bot is thinking..." until the deferred message is edited.
   * @param ephemeral Whether to make the deferred message ephemeral.
   * @returns Whether the deferred message passed
   */
  async defer(ephemeral = false): Promise<boolean> {
    if (!this.initiallyResponded && !this.deferred) {
      this.initiallyResponded = true;
      this.deferred = true;
      clearTimeout(this._timeout);
      await this._respond({
        status: 200,
        body: {
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: ephemeral ? InteractionResponseFlags.EPHEMERAL : 0
          }
        }
      });
      return true;
    }

    return false;
  }

  /**
   * Creates a message that prompts the user for a premium subscription.
   * @returns Whether the message passed
   * @deprecated Use `ComponentButtonPremium` instead.
   */
  async promptPremium(): Promise<boolean> {
    if (!this.initiallyResponded && !this.deferred) {
      this.initiallyResponded = true;
      this.deferred = true;
      clearTimeout(this._timeout);
      await this._respond({
        status: 200,
        body: {
          type: InteractionResponseType.PREMIUM_REQUIRED,
          data: {}
        }
      });
      return true;
    }

    return false;
  }

  /**
   * Registers a component callback from the initial message.
   * This unregisters automatically when the context expires.
   * @param custom_id The custom ID of the component to register
   * @param callback The callback to use on interaction
   * @param expiration The expiration time of the callback in milliseconds. Use null for no expiration (Although, in this case, global components might be more consistent).
   * @param onExpired A function to be called when the component expires.
   */
  registerComponent(
    custom_id: string,
    callback: ComponentRegisterCallback,
    expiration: number = 1000 * 60 * 15,
    onExpired?: () => void
  ) {
    if (!this.initiallyResponded || this.deferred)
      throw new Error('You must send a message before registering components');
    if (!this.messageID)
      throw new Error('Fetch your original message or use deferred messages before registering components');

    this.creator._componentCallbacks.set(`${this.messageID}-${custom_id}`, {
      callback,
      expires: expiration != null ? Date.now() + expiration : undefined,
      onExpired
    });

    if (expiration != null && this.creator.options.componentTimeouts)
      setTimeout(() => {
        if (this.creator._componentCallbacks.has(`${this.messageID}-${custom_id}`)) {
          if (onExpired) onExpired();
          this.creator._componentCallbacks.delete(`${this.messageID}-${custom_id}`);
        }
      }, expiration);
  }

  /**
   * Registers a component callback from a message.
   * This unregisters automatically when the context expires.
   * @param message_id The message ID of the component to register
   * @param custom_id The custom ID of the component to register
   * @param callback The callback to use on interaction
   * @param expiration The expiration time of the callback in milliseconds. Use null for no expiration (Although, in this case, global components might be more consistent).
   * @param onExpired A function to be called when the component expires.
   */
  registerComponentFrom(
    message_id: string,
    custom_id: string,
    callback: ComponentRegisterCallback,
    expiration: number = 1000 * 60 * 15,
    onExpired?: () => void
  ) {
    this.creator._componentCallbacks.set(`${message_id}-${custom_id}`, {
      callback,
      expires: expiration != null ? Date.now() + expiration : undefined,
      onExpired
    });

    if (expiration != null && this.creator.options.componentTimeouts)
      setTimeout(() => {
        if (this.creator._componentCallbacks.has(`${message_id}-${custom_id}`)) {
          if (onExpired) onExpired();
          this.creator._componentCallbacks.delete(`${message_id}-${custom_id}`);
        }
      }, expiration);
  }

  /**
   * Unregisters a component callback.
   * @param custom_id The custom ID of the component to unregister
   * @param message_id The message ID of the component to unregister, defaults to initial message ID if any
   */
  unregisterComponent(custom_id: string, message_id?: string) {
    if (!message_id) {
      if (!this.messageID) throw new Error('The initial message ID was not provided by the context!');
      else message_id = this.messageID;
    }
    return this.creator._componentCallbacks.delete(`${message_id}-${custom_id}`);
  }

  /**
   * Registers a wildcard component callback on a message.
   * This unregisters automatically when the context expires.
   * @param message_id The message ID of the component to register
   * @param callback The callback to use on interaction
   * @param expiration The expiration time of the callback in milliseconds. Use null for no expiration (Although, in this case, global components might be more consistent).
   * @param onExpired A function to be called when the component expires.
   */
  registerWildcardComponent(
    message_id: string,
    callback: ComponentRegisterCallback,
    expiration: number = 1000 * 60 * 15,
    onExpired?: () => void
  ) {
    if (this.expired) throw new Error('This interaction has expired');

    this.creator._componentCallbacks.set(`${message_id}-*`, {
      callback,
      expires: expiration != null ? this.invokedAt + expiration : undefined,
      onExpired
    });

    if (expiration != null && this.creator.options.componentTimeouts)
      setTimeout(() => {
        if (this.creator._componentCallbacks.has(`${message_id}-*`)) {
          if (onExpired) onExpired();
          this.creator._componentCallbacks.delete(`${message_id}-*`);
        }
      }, expiration);
  }

  /**
   * Unregisters a component callback.
   * @param message_id The message ID of the component to unregister, defaults to the invoking message ID.
   */
  unregisterWildcardComponent(message_id: string) {
    return this.creator._componentCallbacks.delete(`${message_id}-*`);
  }
}

/** The options for {@link MessageInteractionContext#edit}. */
export interface EditMessageOptions {
  /** The message content. */
  content?: string;
  /** The embeds of the message. */
  embeds?: MessageEmbedOptions[];
  /** The mentions allowed to be used in this message. */
  allowedMentions?: MessageAllowedMentions;
  /** The attachment(s) to send with the message. */
  files?: MessageFile[];
  /** The components of the message. */
  components?: ComponentActionRow[];
  /** The attachment data of the message. */
  attachments?: MessageAttachmentOptions[];
}

/** A file within {@link EditMessageOptions}. */
export interface MessageFile {
  /** The attachment to send. */
  file: any;
  /** The name of the file. */
  name: string;
}

/** A message attachment describing a file. */
export interface MessageAttachmentOptions {
  /** The name of the attachment. */
  name?: string;
  /** The ID of the attachment. For existing attachments, this must be the ID snowflake of the attachment, otherwise, this will be the index of the files being sent to Discord. */
  id: string | number;
  /** The description of the attachment. */
  description?: string;
}

/** The options for {@link MessageInteractionContext#send} and {@link MessageInteractionContext#sendFollowUp}. */
export interface MessageOptions extends EditMessageOptions {
  /** Whether to use TTS for the content. */
  tts?: boolean;
  /** The flags to use in the message. */
  flags?: number;
  /**
   * Whether or not the message should be ephemeral.
   * Ignored if `flags` is defined.
   */
  ephemeral?: boolean;
}
