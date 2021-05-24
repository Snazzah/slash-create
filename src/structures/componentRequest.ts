import { MessageComponentRequestData, PartialMessage } from '../constants';
import SlashCreator from '../creator';
import { RespondFunction } from '../server';
import Member from './member';
import User from './user';

/** Represents a request from a message component. */
class ComponentRequest {
  /** The creator of the request. */
  readonly creator: SlashCreator;
  /** The request data. */
  readonly data: MessageComponentRequestData;
  /** The interaction's token. */
  readonly interactionToken: string;
  /** The interaction's ID. */
  readonly interactionID: string;
  /** The interaction's message. */
  readonly message: PartialMessage;
  /** The channel ID that the command was invoked in. */
  readonly channelID: string;
  /** The guild ID that the command was invoked in. */
  readonly guildID?: string;
  /** The member that invoked the command. */
  readonly member?: Member;
  /** The user that invoked the command. */
  readonly user: User;

  /** Whether the response was sent. */
  responded = false;
  /** The initial response function. */
  private _respond: RespondFunction;
  /** The timeout for the auto-response. */
  private _timeout?: any;

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data for the context.
   * @param respond The response function for the interaction.
   */
  constructor(creator: SlashCreator, data: MessageComponentRequestData, respond: RespondFunction) {
    this.creator = creator;
    this.data = data;
    this._respond = respond;

    this.interactionToken = data.token;
    this.interactionID = data.id;
    this.message = data.message;
    this.channelID = data.channel_id;
    this.guildID = 'guild_id' in data ? data.guild_id : undefined;
    this.member = 'guild_id' in data ? new Member(data.member, this.creator) : undefined;
    this.user = new User('guild_id' in data ? data.member.user : data.user, this.creator);
  }

  /**
   * Acknowledges the interaction without replying.
   * @param ephemeral Whether to make the deferred message ephemeral.
   * @returns Whether the acknowledgement passed passed
   */
  async acknowledge(): Promise<boolean> {
    if (!this.responded) {
      this.responded = true;
      clearTimeout(this._timeout);
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

  /** @hidden */
  toString() {
    return `[ComponentRequest ${this.interactionID}]`;
  }
}

export default ComponentRequest;
