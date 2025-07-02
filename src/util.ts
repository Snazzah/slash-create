import {
  ApplicationCommandOption,
  CommandOptionType,
  InitialCallbackResponse,
  InteractionCallbackResponse
} from './constants';
import { MessageInteractionContext } from './structures/interfaces/messageInteraction';
import { BaseInteractionContext, Message } from './web';

export function formatAllowedMentions(
  allowed: MessageAllowedMentions | FormattedAllowedMentions,
  defaultMentions?: FormattedAllowedMentions
): FormattedAllowedMentions {
  if (!allowed && defaultMentions) return defaultMentions;
  if ('parse' in allowed) return allowed as FormattedAllowedMentions;
  const result: FormattedAllowedMentions = {
    parse: []
  };

  if (allowed.everyone) result.parse.push('everyone');

  if (allowed.roles === true) result.parse.push('roles');
  else if (Array.isArray(allowed.roles)) {
    if (allowed.roles.length > 100) throw new Error('Allowed role mentions cannot exceed 100.');
    result.roles = allowed.roles;
  }

  if (allowed.users === true) result.parse.push('users');
  else if (Array.isArray(allowed.users)) {
    if (allowed.users.length > 100) throw new Error('Allowed user mentions cannot exceed 100.');
    result.users = allowed.users;
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function oneLine(strings: string | TemplateStringsArray, ..._: any[]) {
  const l = arguments.length;
  const substitutions = Array(l > 1 ? l - 1 : 0);
  for (let k = 1; k < l; k++) substitutions[k - 1] = arguments[k];

  if (typeof strings === 'string') return strings.replace(/(?:\n(?:\s*))+/g, ' ').trim();
  return strings
    .reduce((res, p) => ''.concat(res, substitutions.shift(), p))
    .replace(/(?:\n(?:\s*))+/g, ' ')
    .trim();
}

export function validateOptions(options: ApplicationCommandOption[], prefix = 'options') {
  function throwError(error = Error, index: number, reason: string, suffix = '') {
    throw new error(`Command ${prefix}[${index}]${suffix}: ${reason}`);
  }

  for (let i = 0; i < options.length; i++) {
    const option = options[i];

    if (!option.type || !CommandOptionType[option.type]) throwError(Error, i, 'Option type is invalid.');

    if (typeof option.name !== 'string') throwError(TypeError, i, 'Option name must be a string.');
    if (option.name !== option.name.toLowerCase()) throwError(Error, i, 'Option name must be lowercase.');
    if (!/^[\p{L}_\d-]{1,32}$/u.test(option.name))
      throwError(RangeError, i, 'Option name must must be under 32 characters, matching this regex: /^[\\w-]{1,32}$/');
    if (typeof option.description !== 'string') throwError(TypeError, i, 'Option description must be a string.');
    if (option.description.length < 1 || option.description.length > 100)
      throwError(RangeError, i, 'Option description must be under 100 characters.');

    if ('options' in option && option.options) {
      if (option.type !== CommandOptionType.SUB_COMMAND && option.type !== CommandOptionType.SUB_COMMAND_GROUP)
        throwError(
          Error,
          i,
          'You cannot use the `options` field in options that are not sub-commands or sub-command groups!'
        );

      if (option.options.length > 25)
        throwError(Error, i, 'The sub-command (group) options exceed 25 commands/options!');

      validateOptions(option.options, `options[${i}].options`);
    }

    if ('choices' in option && option.choices) {
      if (
        // @ts-ignore
        option.type === CommandOptionType.SUB_COMMAND ||
        // @ts-ignore
        option.type === CommandOptionType.SUB_COMMAND_GROUP ||
        // @ts-ignore
        option.type === CommandOptionType.BOOLEAN
      )
        throwError(
          Error,
          i,
          'You cannot use the `choices` field in options that are sub-commands, sub-command groups or booleans!'
        );

      if (option.choices.length > 25) throwError(Error, i, 'The choices exceed 25 commands/options!');

      for (let ii = 0; ii < option.choices.length; ii++) {
        const choice = option.choices[ii];

        if (!choice.name || choice.name.length > 100)
          throwError(RangeError, i, 'The choice name must be not exceed 100 characters!', `.choices[${ii}]`);
      }
    }
  }
}

export function generateID() {
  return (Date.now() + Math.round(Math.random() * 1000)).toString(36);
}

export function convertCallbackResponse(
  response: InteractionCallbackResponse,
  ctx: BaseInteractionContext
): InitialCallbackResponse {
  const result: InitialCallbackResponse = {
    interaction: {
      id: response.interaction.id,
      type: response.interaction.type,
      activityInstanceID: response.interaction.activity_instance_id,
      responseMessageID: response.interaction.response_message_id,
      responseMessageLoading: response.interaction.response_message_loading,
      responseMessageEphemeral: response.interaction.response_message_ephemeral
    }
  };

  const isMessageCtx = ctx instanceof MessageInteractionContext;

  if (response.interaction.response_message_id && isMessageCtx)
    ctx.messageID = response.interaction.response_message_id;

  if (response.resource) {
    result.resource = {
      type: response.resource.type
    };

    if (response.resource.activity_instance)
      result.resource.activityInstance = { id: response.resource.activity_instance.id };

    if (response.resource.message)
      result.resource.message = new Message(response.resource.message, ctx.creator, isMessageCtx ? ctx : undefined);
  }

  return result;
}

/**
 * Calculates the timestamp in milliseconds associated with a Discord ID/snowflake
 * @param id The ID of a structure
 */
export function getCreatedAt(id: string) {
  return getDiscordEpoch(id) + 1420070400000;
}

/**
 * Gets the number of milliseconds since epoch represented by an ID/snowflake
 * @param id The ID of a structure
 */
export function getDiscordEpoch(id: string) {
  return Math.floor(Math.floor(Number(BigInt(id) / 4194304n)));
}

/** The allowed mentions for a {@link Message}. */
export interface MessageAllowedMentions {
  everyone?: boolean;
  repliedUser?: boolean;
  roles?: boolean | string[];
  users?: boolean | string[];
}

/**
 * The formatted allowed_mentions for Discord.
 * @private
 */
export interface FormattedAllowedMentions {
  parse: ('everyone' | 'roles' | 'users')[];
  replied_user?: boolean;
  roles?: string[];
  users?: string[];
}

/** @hidden */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
