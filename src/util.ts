import { ApplicationCommandOption, CommandOptionType } from './constants';
import nacl from 'tweetnacl';
import { fromPairs, sortBy, toPairs } from 'lodash';

/**
 * Validates a payload from Discord against its signature and key.
 *
 * @param rawBody - The raw payload data
 * @param signature - The signature from the `X-Signature-Ed25519` header
 * @param timestamp - The timestamp from the `X-Signature-Timestamp` header
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns Whether or not validation was successful
 */
export async function verifyKey(
  body: string,
  signature: string,
  timestamp: string,
  clientPublicKey: string
): Promise<boolean> {
  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(clientPublicKey, 'hex')
    );
  } catch {
    return false;
  }
}

/** The allowed mentions for a {@link Message}. */
export interface MessageAllowedMentions {
  everyone: boolean;
  roles?: boolean | string[];
  users?: boolean | string[];
}

/**
 * The formatted allowed_mentions for Discord.
 * @private
 */
export interface FormattedAllowedMentions {
  parse: ('everyone' | 'roles' | 'users')[];
  roles?: string[];
  users?: string[];
}

export function formatAllowedMentions(
  allowed: MessageAllowedMentions,
  defaultMentions?: FormattedAllowedMentions
): FormattedAllowedMentions {
  if (!allowed && defaultMentions) return defaultMentions;
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
export function oneLine(strings: TemplateStringsArray, ..._: any[]) {
  return strings[0].replace(/(?:\n(?:\s*))+/g, ' ').trim();
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
    if (option.name.length < 3 || option.name.length > 32)
      throwError(RangeError, i, 'Option name must be between 3 and 32 characters.');
    if (!/^[a-z0-9_-]+$/.exec(option.name))
      throwError(RangeError, i, 'Option name must lowercase characters, numbers, hyphens and underscores.');
    if (typeof option.description !== 'string') throwError(TypeError, i, 'Option description must be a string.');
    if (option.description.length < 1 || option.description.length > 100)
      throwError(RangeError, i, 'Option description must be under 100 characters.');

    if (option.options) {
      if (option.type !== CommandOptionType.SUB_COMMAND && option.type !== CommandOptionType.SUB_COMMAND_GROUP)
        throwError(
          Error,
          i,
          'You cannot use the `options` field in options that are not sub-commands or sub-command groups!'
        );

      if (option.options.length > 10)
        throwError(Error, i, 'The sub-command (group) options exceed 10 commands/options!');

      validateOptions(option.options, `options[${i}].options`);
    }

    if (option.choices) {
      if (
        option.type === CommandOptionType.SUB_COMMAND ||
        option.type === CommandOptionType.SUB_COMMAND_GROUP ||
        option.type === CommandOptionType.BOOLEAN
      )
        throwError(
          Error,
          i,
          'You cannot use the `choices` field in options that are sub-commands, sub-command groups or booleans!'
        );

      if (option.choices.length > 10) throwError(Error, i, 'The choices exceed 10 commands/options!');

      for (let ii = 0; ii < option.choices.length; ii++) {
        const choice = option.choices[ii];

        if (!choice.name || choice.name.length < 3 || choice.name.length > 32)
          throwError(Error, i, 'The choice name must be between 3 and 32 characters!', `.choices[${ii}]`);
      }
    }
  }
}

export function objectKeySort(obj: any) {
  let pairs = sortBy(toPairs(obj), 0);

  // Iterate through pairs to find objects in
  pairs = pairs.map(([key, value]) => {
    if (Array.isArray(value))
      return [
        key,
        sortBy(value).map((arrobj) => {
          if (typeof arrobj === 'object') return objectKeySort(arrobj);
          else return arrobj;
        })
      ];
    else if (typeof value === 'object') return [key, objectKeySort(value)];
    else return [key, value];
  });

  return fromPairs(pairs);
}
