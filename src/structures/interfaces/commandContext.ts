import { RespondFunction } from '../../server';
import { SlashCreator } from '../../creator';
import { AnyCommandOption, ApplicationCommandType, AttachmentData, InteractionRequestData } from '../../constants';
import { User } from '../user';
import { Collection } from '../../util/collection';
import { Channel } from '../channel';
import { Role } from '../role';
import { ResolvedMember } from '../resolvedMember';
import { Message } from '../message';
import { ModalSendableContext } from './modalSendableContext';

/** Context representing a command interaction. */
export class CommandContext extends ModalSendableContext {
  /** The full interaction data. */
  readonly data: InteractionRequestData;

  /** The command's type. */
  readonly commandType: ApplicationCommandType;
  /** The command's name. */
  readonly commandName: string;
  /** The command's ID. */
  readonly commandID: string;
  /** The ID of the target user/message. */
  readonly targetID?: string;
  /** The options given to the command. */
  readonly options: { [key: string]: any };
  /** The subcommands the member used in order. */
  readonly subcommands: string[];

  /** The resolved users of the interaction. */
  readonly users = new Collection<string, User>();
  /** The resolved members of the interaction. */
  readonly members = new Collection<string, ResolvedMember>();
  /** The resolved roles of the interaction. */
  readonly roles = new Collection<string, Role>();
  /** The resolved channels of the interaction. */
  readonly channels = new Collection<string, Channel>();
  /** The resolved messages of the interaction. */
  readonly messages = new Collection<string, Message>();
  /** The resolved attachments of the interaction. */
  readonly attachments = new Collection<string, AttachmentData>();

  /** Whether the context is from a webserver. */
  private webserverMode: boolean;

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data for the context.
   * @param respond The response function for the interaction.
   * @param webserverMode Whether the interaction was from a webserver.
   * @param deferEphemeral Whether the context should auto-defer ephemeral messages.
   */
  constructor(
    creator: SlashCreator,
    data: InteractionRequestData,
    respond: RespondFunction,
    webserverMode: boolean,
    deferEphemeral = false
  ) {
    super(creator, data, respond);
    this.data = data;
    this.webserverMode = webserverMode;

    this.commandType = data.data.type;
    this.commandName = data.data.name;
    this.commandID = data.data.id;
    if (data.data.target_id) this.targetID = data.data.target_id;
    this.options = data.data.options ? CommandContext.convertOptions(data.data.options) : {};
    this.subcommands = data.data.options ? CommandContext.getSubcommandArray(data.data.options) : [];

    if (data.data.resolved) {
      if (data.data.resolved.users)
        Object.keys(data.data.resolved.users).forEach((id) =>
          this.users.set(id, new User(data.data.resolved!.users![id], this.creator))
        );
      if (data.data.resolved.members)
        Object.keys(data.data.resolved.members).forEach((id) =>
          this.members.set(
            id,
            new ResolvedMember(
              data.data.resolved!.members![id],
              data.data.resolved!.users![id],
              this.creator,
              this.guildID!
            )
          )
        );
      if (data.data.resolved.roles)
        Object.keys(data.data.resolved.roles).forEach((id) =>
          this.roles.set(id, new Role(data.data.resolved!.roles![id], this.creator))
        );
      if (data.data.resolved.channels)
        Object.keys(data.data.resolved.channels).forEach((id) =>
          this.channels.set(id, new Channel(data.data.resolved!.channels![id]))
        );
      if (data.data.resolved.messages)
        Object.keys(data.data.resolved.messages).forEach((id) =>
          this.messages.set(id, new Message(data.data.resolved!.messages![id], this.creator))
        );
      if (data.data.resolved.attachments)
        Object.keys(data.data.resolved.attachments).forEach((id) =>
          this.attachments.set(id, data.data.resolved!.attachments![id])
        );
    }

    // Auto-defer if no response was given in 2 seconds
    this._timeout = setTimeout(() => this.defer(deferEphemeral || false), 2000);
  }

  /**
   * The target message of the interaction.
   * Will be `null` if it's not from a message command.
   */
  get targetMessage() {
    if (this.commandType === ApplicationCommandType.MESSAGE && this.targetID) return this.messages.get(this.targetID);
    else return null;
  }

  /**
   * The target user of the interaction.
   * Will be `null` if it's not from a user command.
   */
  get targetUser() {
    if (this.commandType === ApplicationCommandType.USER && this.targetID) return this.users.get(this.targetID);
    else return null;
  }

  /**
   * The target member of the interaction.
   * Will be `null` if it's not from a user command.
   */
  get targetMember() {
    if (this.commandType === ApplicationCommandType.USER && this.targetID) return this.members.get(this.targetID);
    else return null;
  }

  /** @private */
  static convertOptions(options: AnyCommandOption[]) {
    const convertedOptions: { [key: string]: any } = {};
    for (const option of options) {
      if ('options' in option)
        convertedOptions[option.name] = option.options ? CommandContext.convertOptions(option.options) : {};
      else convertedOptions[option.name] = 'value' in option && option.value !== undefined ? option.value : {};
    }
    return convertedOptions;
  }

  /** @private */
  static getSubcommandArray(options: AnyCommandOption[]) {
    const result: string[] = [];
    for (const option of options) {
      if ('options' in option || !('value' in option))
        result.push(option.name, ...(option.options ? CommandContext.getSubcommandArray(option.options) : []));
    }
    return result;
  }
}

export const Context = CommandContext;
