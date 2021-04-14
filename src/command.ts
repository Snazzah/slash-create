import {
  ApplicationCommandOption,
  ApplicationCommandPermissions,
  PartialApplicationCommand,
  PermissionNames
} from './constants';
import CommandContext from './context';
import SlashCreator from './creator';
import { oneLine, validateOptions } from './util';

/** The options for a {@link SlashCommand}. */
export interface SlashCommandOptions {
  /** The name of the command. */
  name: string;
  /** The description of the command. */
  description: string;
  /** The guild ID(s) that this command will be assigned to. */
  guildIDs?: string | string[];
  /** The required permission(s) for this command. */
  requiredPermissions?: Array<string>;
  /** The command's options. */
  options?: ApplicationCommandOption[];
  /** The throttling options for the command. */
  throttling?: ThrottlingOptions;
  /** Whether this command is used for unknown commands. */
  unknown?: boolean;
  /** Whether responses from this command should defer ephemeral messages. */
  deferEphemeral?: boolean;
  /** Whether to enable this command for everyone by default. `true` by default. */
  defaultPermission?: boolean;
  /** The command permissions per guild */
  permissions?: CommandPermissions;
}

/**
 * The command permission for a {@link SlashCommand}.
 * The object is a guild ID mapped to an array of {@link ApplicationCommandPermissions}.
 * @example
 * {
 *   '<guild_id>': [
 *     {
 *       type: ApplicationCommandPermissionType.USER,
 *       id: '<user_id>',
 *       permission: true
 *     }
 *   ]
 * }
 */
export interface CommandPermissions {
  [guildID: string]: ApplicationCommandPermissions[];
}

/** The throttling options for a {@link SlashCommand}. */
export interface ThrottlingOptions {
  /** Maximum number of usages of the command allowed in the time frame. */
  usages: number;
  /** Amount of time to count the usages of the command within (in seconds). */
  duration: number;
}

/** @private */
export interface ThrottleObject {
  start: number;
  usages: number;
  timeout: any;
}

/** Represents a Discord slash command. */
class SlashCommand {
  /** The command's name. */
  readonly commandName: string;
  /** The command's description. */
  readonly description: string;
  /** The options for the command. */
  readonly options?: ApplicationCommandOption[];
  /** The guild ID(s) for the command. */
  readonly guildIDs?: string[];
  /** The permissions required to use this command. */
  readonly requiredPermissions?: Array<string>;
  /** The throttling options for this command. */
  readonly throttling?: ThrottlingOptions;
  /** Whether this command is used for unknown commands. */
  readonly unknown: boolean;
  /** Whether responses from this command should defer ephemeral messages. */
  readonly deferEphemeral: boolean;
  /** Whether to enable this command for everyone by default. */
  readonly defaultPermission: boolean;
  /** The command permissions per guild. */
  readonly permissions?: CommandPermissions;
  /**
   * The file path of the command.
   * Used for refreshing the require cache.
   * Set this to `__filename` in the constructor to enable cache clearing.
   */
  filePath?: string;
  /**
   * A map of command IDs with its guild ID (or 'global' for global commands), used for syncing command permissions.
   * This will populate when syncing or collecting with {@link SlashCreator#collectCommandIDs}.
   */
  ids = new Map<string, string>();

  /** The creator responsible for this command. */
  readonly creator: SlashCreator;

  /** Current throttle objects for the command, mapped by user ID. */
  private _throttles = new Map<string, ThrottleObject>();

  /**
   * @param creator The instantiating creator.
   * @param opts The options for the command.
   */
  constructor(creator: SlashCreator, opts: SlashCommandOptions) {
    if (this.constructor.name === 'SlashCommand') throw new Error('The base SlashCommand cannot be instantiated.');
    this.creator = creator;

    if (!opts.unknown) SlashCommand.validateOptions(opts);

    this.commandName = opts.name;
    this.description = opts.description;
    this.options = opts.options;
    if (opts.guildIDs) this.guildIDs = typeof opts.guildIDs == 'string' ? [opts.guildIDs] : opts.guildIDs;
    this.requiredPermissions = opts.requiredPermissions;
    this.throttling = opts.throttling;
    this.unknown = opts.unknown || false;
    this.deferEphemeral = opts.deferEphemeral || false;
    this.defaultPermission = typeof opts.defaultPermission === 'boolean' ? opts.defaultPermission : true;
    if (opts.permissions) this.permissions = opts.permissions;
  }

  /**
   * The JSON for using commands in Discord's API.
   * @private
   */
  get commandJSON(): PartialApplicationCommand {
    return {
      name: this.commandName,
      description: this.description,
      default_permission: this.defaultPermission,
      ...(this.options ? { options: this.options } : {})
    };
  }

  /**
   * The internal key name for the command.
   * @private
   */
  get keyName() {
    const prefix = this.guildIDs ? this.guildIDs.join(',') : 'global';
    return `${prefix}:${this.commandName}`;
  }

  /**
   * Checks whether the context member has permission to use the command.
   * @param ctx The triggering context
   * @return {boolean|string} Whether the member has permission, or an error message to respond with if they don't
   */
  hasPermission(ctx: CommandContext): boolean | string {
    if (this.requiredPermissions && ctx.member) {
      const missing = ctx.member.permissions.missing(this.requiredPermissions);
      if (missing.length > 0) {
        if (missing.length === 1) {
          return `The \`${this.commandName}\` command requires you to have the "${
            PermissionNames[missing[0]]
          }" permission.`;
        }
        return oneLine`
          The \`${this.commandName}\` command requires you to have the following permissions:
          ${missing.map((perm) => PermissionNames[perm]).join(', ')}
        `;
      }
    }

    return true;
  }

  /**
   * Called when the command is prevented from running.
   * @param ctx Command context the command is running from
   * @param reason Reason that the command was blocked
   * (built-in reasons are `permission`, `throttling`)
   * @param data Additional data associated with the block.
   * - permission: `response` ({@link string}) to send
   * - throttling: `throttle` ({@link Object}), `remaining` ({@link number}) time in seconds
   */
  onBlock(ctx: CommandContext, reason: string, data?: any): any {
    switch (reason) {
      case 'permission': {
        if (data.response) return ctx.send(data.response, { ephemeral: true });
        return ctx.send(`You do not have permission to use the \`${this.commandName}\` command.`, { ephemeral: true });
      }
      case 'throttling': {
        return ctx.send(
          `You may not use the \`${this.commandName}\` command again for another ${data.remaining.toFixed(1)} seconds.`,
          { ephemeral: true }
        );
      }
      default:
        return null;
    }
  }

  /**
   * Called when the command produces an error while running.
   * @param err Error that was thrown
   * @param ctx Command context the command is running from
   */
  onError(err: Error, ctx: CommandContext): any {
    if (!ctx.expired && !ctx.initiallyResponded)
      return ctx.send('An error occurred while running the command.', { ephemeral: true });
  }

  /**
   * Creates/obtains the throttle object for a user, if necessary.
   * @param userID ID of the user to throttle for
   * @private
   */
  throttle(userID: string): ThrottleObject | null {
    if (!this.throttling) return null;

    let throttle = this._throttles.get(userID);
    if (!throttle) {
      throttle = {
        start: Date.now(),
        usages: 0,
        timeout: setTimeout(() => {
          this._throttles.delete(userID);
        }, this.throttling.duration * 1000)
      };
      this._throttles.set(userID, throttle);
    }

    return throttle;
  }

  /** Reloads the command. */
  reload() {
    if (!this.filePath) throw new Error('Cannot reload a command without a file path defined!');
    const newCommand = require(this.filePath);
    this.creator.reregisterCommand(newCommand, this);
  }

  /** Unloads the command. */
  unload() {
    if (this.filePath && require.cache[this.filePath]) delete require.cache[this.filePath];
    this.creator.unregisterCommand(this);
  }

  /**
   * Runs the command.
   * @param ctx The context of the interaction
   */
  async run(ctx: CommandContext): Promise<any> { // eslint-disable-line @typescript-eslint/no-unused-vars, prettier/prettier
    throw new Error(`${this.constructor.name} doesn't have a run() method.`);
  }

  /**
   * Finalizes the return output
   * @param response The response from the command
   * @param ctx The context of the interaction
   * @private
   */
  finalize(response: any, ctx: CommandContext): any {
    if (!response && !ctx.initiallyResponded) return;

    if (typeof response === 'string' || (response && response.constructor && response.constructor.name === 'Object'))
      return ctx.send(response);
  }

  /**
   * Validates {@link SlashCommandOptions}.
   * @private
   */
  static validateOptions(opts: SlashCommandOptions) {
    if (typeof opts.name !== 'string') throw new TypeError('Command name must be a string.');
    if (opts.name !== opts.name.toLowerCase()) throw new Error('Command name must be lowercase.');
    if (!/^[\w-]{1,32}$/.test(opts.name))
      throw new RangeError('Command name must be under 32 characters, matching this regex: /^[\\w-]{1,32}$/');

    if (typeof opts.description !== 'string') throw new TypeError('Command description must be a string.');
    if (opts.description.length < 1 || opts.description.length > 100)
      throw new RangeError('Command description must be under 100 characters.');

    if (opts.options) {
      if (!Array.isArray(opts.options)) throw new TypeError('Command options must be an array of options.');
      if (opts.options.length > 25) throw new RangeError('Command options cannot exceed 25 options.');

      validateOptions(opts.options);
    }

    if (opts.requiredPermissions) {
      if (!Array.isArray(opts.requiredPermissions))
        throw new TypeError('Command required permissions must be an Array of permission key strings.');
      for (const perm of opts.requiredPermissions)
        if (!PermissionNames[perm]) throw new RangeError(`Invalid command required permission: ${perm}`);
    }

    if (opts.throttling) {
      if (typeof opts.throttling !== 'object') throw new TypeError('Command throttling must be an Object.');
      if (typeof opts.throttling.usages !== 'number' || isNaN(opts.throttling.usages)) {
        throw new TypeError('Command throttling usages must be a number.');
      }
      if (opts.throttling.usages < 1) throw new RangeError('Command throttling usages must be at least 1.');
      if (typeof opts.throttling.duration !== 'number' || isNaN(opts.throttling.duration)) {
        throw new TypeError('Command throttling duration must be a number.');
      }
      if (opts.throttling.duration < 1) throw new RangeError('Command throttling duration must be at least 1.');
    }
  }
}

export default SlashCommand;
