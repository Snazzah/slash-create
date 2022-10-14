import { AnyCommandOption, CommandAutocompleteRequestData, InteractionResponseType } from '../../constants';
import { SlashCreator } from '../../creator';
import { RespondFunction } from '../../server';
import { BaseInteractionContext } from './baseInteraction';
import { CommandContext } from './commandContext';

/** Represents a autocomplete interaction context. */
export class AutocompleteContext extends BaseInteractionContext {
  /** The full interaction data. */
  readonly data: CommandAutocompleteRequestData;
  /** The options given to the command. */
  readonly options: { [key: string]: any };
  /** The option name that is currently focused.  */
  readonly focused: string;
  /** The subcommands the member used in order. */
  readonly subcommands: string[];

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
    super(creator, data);
    this._respond = respond;

    this.data = data;
    this.options = CommandContext.convertOptions(data.data.options);
    this.subcommands = CommandContext.getSubcommandArray(data.data.options);
    this.focused = AutocompleteContext.getFocusedOption(data.data.options)!;
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
