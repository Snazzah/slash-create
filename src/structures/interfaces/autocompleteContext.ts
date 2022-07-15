import { AnyCommandOption, CommandAutocompleteRequestData, InteractionResponseType } from '../../constants';
import { SlashCreator } from '../../creator';
import { RespondFunction } from '../../server';
import { Member } from '../member';
import { Permissions } from '../permissions';
import { User } from '../user';
import { CommandContext } from './commandContext';

/** Represents a autocomplete interaction context. */
export class AutocompleteContext {
  /** The full interaction data. */
  readonly data: CommandAutocompleteRequestData;
  /** The creator of the interaction request. */
  readonly creator: SlashCreator;
  /** The interaction's token. */
  readonly interactionToken: string;
  /** The interaction's ID. */
  readonly interactionID: string;
  /** The channel ID that the interaction was invoked in. */
  readonly channelID: string;
  /** The guild ID that the interaction was invoked in. */
  readonly guildID?: string;
  /** The member that invoked the interaction. */
  readonly member?: Member;
  /** The user that invoked the interaction. */
  readonly user: User;
  /** The options given to the command. */
  readonly options: { [key: string]: any };
  /** The option name that is currently focused.  */
  readonly focused: string;
  /** The subcommands the member used in order. */
  readonly subcommands: string[];
  /** The time when the interaction was created. */
  readonly invokedAt: number = Date.now();
  /** The permissions the application has. */
  readonly appPermissions?: Permissions;

  /** Whether the interaction has been responded to. */
  responded = false;
  /** @hidden */
  protected _respond: RespondFunction;

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data.
   * @param respond The response function for the interaction.
   */
  constructor(creator: SlashCreator, data: CommandAutocompleteRequestData, respond: RespondFunction) {
    this.creator = creator;
    this._respond = respond;

    this.data = data;
    this.interactionToken = data.token;
    this.interactionID = data.id;
    this.channelID = data.channel_id;
    this.guildID = 'guild_id' in data ? data.guild_id : undefined;
    this.member = 'guild_id' in data ? new Member(data.member, this.creator, data.guild_id) : undefined;
    this.user = new User('guild_id' in data ? data.member.user : data.user, this.creator);
    this.options = CommandContext.convertOptions(data.data.options);
    this.subcommands = CommandContext.getSubcommandArray(data.data.options);
    this.focused = AutocompleteContext.getFocusedOption(data.data.options)!;
    this.appPermissions = data.app_permissions ? new Permissions(BigInt(data.app_permissions)) : undefined;
  }

  /** Whether the interaction has expired. Interactions last 15 minutes. */
  get expired() {
    return this.invokedAt + 1000 * 60 * 15 < Date.now();
  }

  /**
   * Sends the results of an autocomplete interaction.
   * @param choices The choices to display
   */
  async sendResults(choices: AutocompleteChoice[]): Promise<boolean> {
    if (this.responded) return false;

    this.responded = true;
    await this._respond({
      status: 200,
      body: {
        type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
        data: { choices }
      }
    });
    return true;
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
  static getFocusedOption(options: AnyCommandOption[]): string | undefined {
    for (const option of options) {
      if ('focused' in option && option.focused) {
        return option.name;
      }
      if ('options' in option && option.options) {
        const nextResult = AutocompleteContext.getFocusedOption(option.options);
        if (nextResult) return nextResult;
      }
    }
  }
}

export interface AutocompleteChoice {
  name: string;
  value: string | number;
}
