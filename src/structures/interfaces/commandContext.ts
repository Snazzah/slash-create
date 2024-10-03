import { RespondFunction } from '../../server';
import { BaseSlashCreator } from '../../creator';
import { AnyCommandOption, ApplicationCommandType, InteractionRequestData } from '../../constants';
import { ModalSendableContext } from './modalSendableContext';

/** Context representing a command interaction. */
export class CommandContext<ServerContext extends any = unknown> extends ModalSendableContext<ServerContext> {
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
  /**
   * The options given to the command.
   * @see https://slash-create.js.org/#/docs/main/latest/general/context-options
   */
  readonly options: { [key: string]: any };
  /** The subcommands the member used in order. */
  readonly subcommands: string[];

  /** Whether the context is from a webserver. */
  private webserverMode: boolean;

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data for the context.
   * @param respond The response function for the interaction.
   * @param webserverMode Whether the interaction was from a webserver.
   * @param deferEphemeral Whether the context should auto-defer ephemeral messages.
   * @param useTimeout Whether to use the deferral timeout.
   */
  constructor(
    creator: BaseSlashCreator,
    data: InteractionRequestData,
    respond: RespondFunction,
    webserverMode: boolean,
    deferEphemeral = false,
    useTimeout = true,
    serverContext: ServerContext
  ) {
    super(creator, data, respond, serverContext);
    this.data = data;
    this.webserverMode = webserverMode;

    this.commandType = data.data.type;
    this.commandName = data.data.name;
    this.commandID = data.data.id;
    if (data.data.target_id) this.targetID = data.data.target_id;
    this.options = data.data.options ? CommandContext.convertOptions(data.data.options) : {};
    this.subcommands = data.data.options ? CommandContext.getSubcommandArray(data.data.options) : [];

    // Auto-defer if no response was given in 2 seconds
    if (useTimeout) this._timeout = setTimeout(() => this.defer(deferEphemeral || false), 2000);
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
