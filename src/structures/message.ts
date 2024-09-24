import {
  AnyComponent,
  ApplicationIntegrationType,
  CommandChannel,
  InteractionType,
  PartialEmoji,
  PollLayoutType,
  StickerFormat,
  UserObject
} from '../constants';
import { EditMessageOptions } from './interfaces/messageInteraction';
import { BaseSlashCreator } from '../creator';
import { MessageInteractionContext } from './interfaces/messageInteraction';
import { User } from './user';
import { Channel } from './channel';
import { PartialBy } from '../util';

/** Represents a Discord message. */
export class Message {
  /** The message's ID */
  readonly id: string;
  /** The message type */
  readonly type: number;
  /** The content of the message */
  readonly content: string;
  /** The ID of the channel the message is in */
  readonly channelID: string;
  /** The call ossociated with the message */
  readonly call?: MessageCall;
  /** The message's components */
  readonly components: AnyComponent[];
  /** The author of the message */
  readonly author: User;
  /** The message's attachments */
  readonly attachments: MessageAttachment[];
  /** The message's stickers */
  readonly stickerItems?: MessageStickerItem[];
  /** The message's embeds */
  readonly embeds: MessageEmbed[];
  /** The message's user mentions */
  readonly mentions: User[];
  /** The message's role mentions */
  readonly roleMentions: string[];
  /** Whether the message mentioned everyone/here */
  readonly mentionedEveryone: boolean;
  /** Whether the message used TTS */
  readonly tts: boolean;
  /** Whether the message is pinned */
  readonly pinned: boolean;
  /** The approximate position of the message in a thread. */
  readonly position?: number;
  /** The poll in the message. */
  readonly poll?: PollObject;
  /** The thread that was started from this message. */
  readonly thread?: Channel;
  /** The timestamp of the message */
  readonly timestamp: number;
  /** The timestamp of when the message was last edited */
  readonly editedTimestamp?: number;
  /** The message's flags */
  readonly flags: number;
  /** The message that this message is referencing */
  readonly messageReference?: MessageReference;
  /** The rich-presence embed used in this message */
  readonly activity?: MessageActivity;
  /** The message's webhook ID */
  readonly webhookID?: string;
  /** The ID of the application that created this message */
  readonly applicationID?: string;
  /**
   * The interaction this message is apart of
   * @deprecated Discord-imposed deprecation in favor of {@see Message#interactionMetadata}
   */
  readonly interaction?: MessageInteraction;
  /** The metadata of the interaction this message is apart of */
  readonly interactionMetadata?: MessageInteractionMetadata;

  /** The context that created the message class */
  private readonly _ctx?: MessageInteractionContext;

  /**
   * @param data The data for the message
   * @param ctx The instantiating context
   */
  constructor(data: MessageData, creator: BaseSlashCreator, ctx?: MessageInteractionContext) {
    if (ctx) this._ctx = ctx;

    this.id = data.id;
    this.type = data.type;
    this.content = data.content;
    this.channelID = data.channel_id;
    this.components = data.components || [];
    this.author = new User(data.author, creator);
    this.attachments = data.attachments;
    this.stickerItems = data.sticker_items;
    if (data.thread) this.thread = new Channel(data.thread);
    this.embeds = data.embeds;
    this.mentions = data.mentions.map((user) => new User(user, creator));
    this.roleMentions = data.mention_roles;
    this.mentionedEveryone = data.mention_everyone;
    this.tts = data.tts;
    this.pinned = data.pinned;
    if (data.call)
      this.call = {
        participants: data.call.participants,
        endedTimestamp: data.call.ended_timestamp
      };
    this.poll = data.poll;
    this.position = data.position;
    this.timestamp = Date.parse(data.timestamp);
    if (data.edited_timestamp) this.editedTimestamp = Date.parse(data.edited_timestamp);
    this.flags = data.flags;
    if (data.message_reference)
      this.messageReference = {
        channelID: data.message_reference.channel_id,
        guildID: data.message_reference.guild_id,
        messageID: data.message_reference.message_id
      };
    if (data.activity)
      this.activity = {
        type: data.activity.type,
        partyID: data.activity.party_id
      };
    this.webhookID = data.webhook_id;
    this.applicationID = data.application_id;
    if (data.interaction)
      this.interaction = {
        id: data.interaction.id,
        type: data.interaction.type,
        name: data.interaction.name,
        user: new User(data.interaction.user, creator)
      };
    if (data.interaction_metadata)
      this.interactionMetadata = this.#convertInteractionMetadata(data.interaction_metadata, creator);
  }

  #convertInteractionMetadata(
    metadata: MessageData['interaction_metadata'],
    creator: BaseSlashCreator
  ): MessageInteractionMetadata | undefined {
    if (!metadata) return undefined;
    return {
      id: metadata.id,
      type: metadata.type,
      userID: metadata.user.id,
      user: new User(metadata.user, creator),
      authorizingIntegrationOwners: metadata.authorizing_integration_owners,
      originalResponseMessageID: metadata.original_response_message_id,
      interactedMessageID: metadata.interacted_message_id,
      triggeringInteractionMetadata: this.#convertInteractionMetadata(metadata.triggering_interaction_metadata, creator)
    };
  }

  /**
   * Edits this message.
   * @param content The content of the message
   */
  edit(content: string | EditMessageOptions) {
    if (!this._ctx) throw new Error('This message was not created from a command context.');
    return this._ctx.edit(this.id, content);
  }

  /** Deletes this message. */
  delete() {
    if (!this._ctx) throw new Error('This message was not created from a command context.');
    return this._ctx.delete(this.id);
  }

  /** @hidden */
  toString() {
    return `[Message ${this.id}]`;
  }
}

/** A message-associated call. */
export interface MessageCall {
  /** The participants of the call. */
  participants: string[];
  /** The time the call ended. */
  endedTimestamp?: string;
}

/** A message interaction. */
export interface MessageInteraction {
  /** The ID of the interaction. */
  id: string;
  /** The type of interaction. */
  type: InteractionType;
  /** The name of the command. */
  name: string;
  /** The user who invoked the interaction. */
  user: User;
}

/** The metadata of a message interaction. */
export interface MessageInteractionMetadata {
  /** The ID of the interaction. */
  id: string;
  /** The type of interaction. */
  type: InteractionType;
  /**
   * The ID of the user who invoked the interaction.
   * @deprecated Use user.id
   */
  userID: string;
  /** The user who invoked the interaction. */
  user: User;
  /** The IDs of the installation contexts that are related to the interaction. */
  authorizingIntegrationOwners: Record<ApplicationIntegrationType, string>;
  /** ID of the original response message, only on follow-up messages. */
  originalResponseMessageID?: string;
  /** ID of the message that contained the interactive component that created this interaction. */
  interactedMessageID?: string;
  /** Metadata for the interaction that was used to open the modal, for modal submit interactions. */
  triggeringInteractionMetadata?: MessageInteractionMetadata;
}

/** A message reference. */
export interface MessageReference {
  /** The ID of the channel the reference is from. */
  channelID: string;
  /** The ID of the guild the reference is from. */
  guildID?: string;
  /** The message ID of the reference. */
  messageID?: string;
}

/** A message activity. */
export interface MessageActivity {
  /** The type of message activity. */
  type: MessageActivityType;
  /** The party ID from the rich presence event. */
  partyID?: string;
}

export enum MessageActivityType {
  JOIN = 1,
  SPECTATE = 2,
  LISTEN = 3,
  JOIN_REQUEST = 5
}

/** A message attachment. */
export interface MessageAttachment {
  /** The ID of the attachment. */
  id: string;
  /** The filename of the attachment. */
  filename: string;
  /** The title of the attachment. */
  title?: number;
  /** The attachment's content type. */
  content_type?: string;
  /** The size of the attachment in bytes. */
  size: number;
  /** The source URL of the attachment. */
  url: string;
  /** The proxied URL of the attachment. */
  proxy_url: string;
  /** The height of the image, if the attachment was an image. */
  height?: number;
  /** The width of the image, if the attachment was an image. */
  width?: number;
  /** Whether this attachment is ephemeral. */
  ephemeral?: boolean;
  /** The duration of the voice message. */
  duration_secs?: number;
  /** Base64 encoded bytearray representing a sampled waveform of the voice message. */
  waveform?: string;
  /** The flags of the attachment. */
  flags?: number;
}

export interface CreatePollOptions {
  /** The question of the poll. */
  question: PollMedia;
  /** The answers of the poll. `answer_id` is optional. */
  answers: PartialBy<PollAnswer, 'answer_id'>[];
  /** The duration (in hours) the poll will be open for */
  duration?: number;
  /** Whether to allow for multiple options to be selected */
  allow_multiselect?: boolean;
  /** The layout type of the poll */
  layout_type?: PollLayoutType;
}

export interface PollObject {
  /** The question of the poll. */
  question: PollMedia;
  /** The answers of the poll. */
  answers: PollAnswer[];
  /** The expiration of the poll */
  expiry: string | null;
  /** Whether you can select multiple options in thie poll */
  allow_multiselect: boolean;
  /** The layout type of the poll */
  layout_type: PollLayoutType;
  /** The results of the poll if finished */
  results?: PollResults;
}

export interface PollResults {
  is_finalized: boolean;
  answer_counts: PollAnswerCount[];
}

export interface PollAnswerCount {
  id: number;
  count: number;
  me_voted: boolean;
}

export interface PollMedia {
  text?: string;
  emoji?: PartialEmoji;
}

export interface PollAnswer {
  answer_id: number;
  poll_media: PollMedia;
}

/** Options to creating a message embed. */
export interface MessageEmbedOptions {
  author?: EmbedAuthorOptions;
  color?: number;
  description?: string;
  fields?: EmbedField[];
  footer?: EmbedFooterOptions;
  image?: EmbedImageOptions;
  thumbnail?: EmbedImageOptions;
  timestamp?: Date | string;
  title?: string;
  url?: string;
}

/** A message embed. */
export interface MessageEmbed extends Omit<MessageEmbedOptions, 'footer' | 'image' | 'thumbnail' | 'author'> {
  author?: EmbedAuthor;
  footer?: EmbedFooter;
  image?: EmbedImage;
  provider?: EmbedProvider;
  thumbnail?: EmbedImage;
  type: string;
  video?: EmbedVideo;
}

export interface EmbedAuthor extends EmbedAuthorOptions {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedAuthorOptions {
  icon_url?: string;
  name: string;
  url?: string;
  proxy_icon_url?: string;
}

export interface EmbedField {
  inline?: boolean;
  name: string;
  value: string;
}

export interface EmbedFooter extends EmbedFooterOptions {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedFooterOptions {
  icon_url?: string;
  text: string;
}

export interface EmbedImage extends EmbedImageOptions {
  height?: number;
  proxy_url?: string;
  width?: number;
}

export interface EmbedImageOptions {
  url?: string;
}

export interface EmbedProvider {
  name?: string;
  url?: string;
}

export interface EmbedVideo {
  height?: number;
  url?: string;
  proxy_url?: string;
  width?: number;
}

export interface MessageStickerItem {
  format_type: StickerFormat;
  id: string;
  name: string;
}

/** @hidden */
export interface MessageData {
  id: string;
  type: number;
  content: string;
  channel_id: string;
  components?: AnyComponent[];
  author: UserObject;
  attachments: MessageAttachment[];
  embeds: MessageEmbed[];
  mentions: UserObject[];
  mention_roles: string[];
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  call?: {
    participants: string[];
    ended_timestamp?: string;
  };
  poll?: PollObject;
  position?: number;
  thread?: CommandChannel;
  timestamp: string;
  edited_timestamp: string | null;
  flags: number;
  sticker_items?: MessageStickerItem[];
  interaction?: {
    id: string;
    type: InteractionType;
    name: string;
    user: UserObject;
  };
  interaction_metadata?: {
    id: string;
    type: InteractionType;
    user: UserObject;
    authorizing_integration_owners: Record<ApplicationIntegrationType, string>;
    original_response_message_id?: string;
    interacted_message_id?: string;
    triggering_interaction_metadata?: {
      id: string;
      type: InteractionType;
      user: UserObject;
      authorizing_integration_owners: Record<ApplicationIntegrationType, string>;
      original_response_message_id?: string;
      interacted_message_id?: string;
    };
  };
  webhook_id?: string;
  application_id?: string;
  message_reference?: {
    channel_id: string;
    guild_id?: string;
    message_id?: string;
  };
  activity?: {
    type: MessageActivityType;
    party_id?: string;
  };
}
