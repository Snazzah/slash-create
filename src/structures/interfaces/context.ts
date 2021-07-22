import { RespondFunction } from '../../server';
import SlashCreator from '../../creator';
import { AnyCommandOption, InteractionRequestData } from '../../constants';
import User from '../user';
import Collection from '@discordjs/collection';
import Channel from '../channel';
import Role from '../role';
import ResolvedMember from '../resolvedMember';
import MessageInteractionContext from './messageInteraction';

/** Context representing a command interaction. */
class CommandContext extends MessageInteractionContext {
  /** The full interaction data. */
  readonly data: InteractionRequestData;

  /** The command's name. */
  readonly commandName: string;
  /** The command's ID. */
  readonly commandID: string;
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

  /** Whether the context is from a webserver. */
  private webserverMode: boolean;
  /** @hidden */
  private _timeout?: any;

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

    this.commandName = data.data.name;
    this.commandID = data.data.id;
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
            new ResolvedMember(data.data.resolved!.members![id], data.data.resolved!.users![id], this.creator)
          )
        );
      if (data.data.resolved.roles)
        Object.keys(data.data.resolved.roles).forEach((id) =>
          this.roles.set(id, new Role(data.data.resolved!.roles![id]))
        );
      if (data.data.resolved.channels)
        Object.keys(data.data.resolved.channels).forEach((id) =>
          this.channels.set(id, new Channel(data.data.resolved!.channels![id]))
        );
    }

    // Auto-defer if no response was given in 2 seconds
    this._timeout = setTimeout(() => this.defer(deferEphemeral || false), 2000);
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

export default CommandContext;
