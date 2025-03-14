import {
  ApplicationCommandOption,
  ApplicationCommandType,
  ApplicationIntegrationType,
  EntryPointHandlerType,
  InteractionContextType,
  PartialApplicationCommand,
  PermissionNames
} from './constants';
import { CommandContext } from './structures/interfaces/commandContext';
import { BaseSlashCreator } from './creator';
import { oneLine, validateOptions } from './util';
import { AutocompleteContext } from './structures/interfaces/autocompleteContext';
import { Permissions } from './structures/permissions';

/** Represents a Discord slash command. */
export class SlashCommand<T = any> {
  /** The command's name. */
  readonly commandName: string;
  /** The localiztions for the command name. */
  nameLocalizations?: Record<string, string>;
  /** The type of command this is. */
  readonly type: ApplicationCommandType;
  /** The command's description. */
  readonly description?: string;
  /** The localiztions for the command description. */
  descriptionLocalizations?: Record<string, string>;
  /** The options for the command. */
  options?: ApplicationCommandOption[];
  /** The guild ID(s) for the command. */
  readonly guildIDs?: string[];
  /** The default member permissions required to use the command. */
  readonly requiredPermissions?: string[];
  /** Whether to check the member's permission within command execution, regardless of admin-set command permissions. */
  readonly forcePermissions: boolean;
  /** The throttling options for this command. */
  readonly throttling?: ThrottlingOptions;
  /** Whether this command is used for unknown commands. */
  readonly unknown: boolean;
  /** Whether responses from this command should defer ephemeral messages. */
  readonly deferEphemeral: boolean;
  /** Whether this command is age-restricted. */
  readonly nsfw: boolean;
  /**
   * Whether to enable this command in direct messages.
   * @deprecated Use {@link SlashCommand#contexts} instead.
   */
  readonly dmPermission: boolean;
  /** The contexts where this command is available. */
  readonly integrationTypes: ApplicationIntegrationType[];
  /** The contexts where this command can be used. */
  readonly contexts: InteractionContextType[];
  /** For entry point commands, determines how this command is handled either by the app or Discord */
  readonly handler?: EntryPointHandlerType;
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
  readonly creator: BaseSlashCreator;

  /** @private */
  private _throttles = new Map<string, ThrottleObject>();

  /**
   * @param creator The instantiating creator.
   * @param opts The options for the command.
   */
  constructor(creator: BaseSlashCreator, opts: SlashCommandOptions) {
    if (this.constructor.name === 'SlashCommand') throw new Error('The base SlashCommand cannot be instantiated.');
    this.creator = creator;

    if (!opts.unknown) SlashCommand.validateOptions(opts);

    this.type = opts.type || ApplicationCommandType.CHAT_INPUT;
    this.commandName = opts.name;
    if (opts.nameLocalizations) this.nameLocalizations = opts.nameLocalizations;
    if (opts.description) this.description = opts.description;
    if (opts.descriptionLocalizations) this.descriptionLocalizations = opts.descriptionLocalizations;
    this.options = opts.options;
    if (opts.guildIDs) this.guildIDs = typeof opts.guildIDs == 'string' ? [opts.guildIDs] : opts.guildIDs;
    if (opts.handler) this.handler = opts.handler;
    this.requiredPermissions = opts.requiredPermissions;
    this.forcePermissions = typeof opts.forcePermissions === 'boolean' ? opts.forcePermissions : false;
    this.nsfw = typeof opts.nsfw === 'boolean' ? opts.nsfw : false;
    this.throttling = opts.throttling;
    this.unknown = opts.unknown || false;
    this.deferEphemeral = opts.deferEphemeral || false;
    this.contexts = opts.contexts || [];
    this.integrationTypes = opts.integrationTypes || [ApplicationIntegrationType.GUILD_INSTALL];
    this.dmPermission =
      typeof opts.dmPermission === 'boolean'
        ? opts.dmPermission
        : this.contexts.length !== 0
          ? this.contexts.includes(InteractionContextType.BOT_DM)
          : true;
  }

  /**
   * The command object serialized into JSON.
   * @param global Whether the command is global or not.
   */
  toCommandJSON(global = true): PartialApplicationCommand {
    return {
      default_member_permissions: this.requiredPermissions
        ? new Permissions(this.requiredPermissions).valueOf().toString()
        : null,
      type: this.type,
      name: this.commandName,
      name_localizations: this.nameLocalizations || null,
      description: this.description || '',
      description_localizations: this.descriptionLocalizations || null,
      ...(global
        ? {
            dm_permission: this.dmPermission,
            contexts: this.contexts.length !== 0 ? this.contexts : null,
            integration_types: this.integrationTypes
          }
        : {}),
      nsfw: this.nsfw,
      ...(this.type === ApplicationCommandType.CHAT_INPUT
        ? {
            ...(this.options
              ? {
                  options: this.options.map((o) => ({
                    ...o,
                    name_localizations: o.name_localizations || null,
                    description_localizations: o.description_localizations || null
                  }))
                }
              : {})
          }
        : {}),
      ...(this.type === ApplicationCommandType.ENTRY_POINT
        ? {
            handler: this.handler
          }
        : {})
    };
  }

  /**
   * Get a string that mentions the command. Retuens null if the ID is not collected.
   * @param subcommands The subcommands to include in the mention.
   * @param guild The guild to fetch the ID from.
   */
  getMention(subcommands?: string, guild?: string) {
    const id = this.ids.get(guild || 'global');
    if (!id) return null;
    return `</${this.commandName}${subcommands ? ` ${subcommands}` : ''}:${id}>`;
  }

  /**
   * The internal key name for the command.
   * @private
   */
  get keyName() {
    const prefix = this.guildIDs ? this.guildIDs.join(',') : 'global';
    return `${this.type}:${prefix}:${this.commandName}`;
  }

  /** The client passed from the creator */
  get client(): T {
    return this.creator.client;
  }

  /**
   * Checks whether the context member has permission to use the command.
   * @param ctx The triggering context
   * @return {boolean|string} Whether the member has permission, or an error message to respond with if they don't
   */
  hasPermission(ctx: CommandContext): boolean | string {
    if (this.requiredPermissions && this.forcePermissions && ctx.member) {
      const missing = ctx.member.permissions.missing(this.requiredPermissions);
      if (missing.length > 0) {
        if (missing.length === 1) {
          return `The \`${this.commandName}\` command requires you to have the "${
            PermissionNames[missing[0]] || missing[0]
          }" permission.`;
        }
        return oneLine`
          The \`${this.commandName}\` command requires you to have the following permissions:
          ${missing.map((perm) => PermissionNames[perm] || perm).join(', ')}
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
        if (data.response) return ctx.send({ content: data.response, ephemeral: true });
        return ctx.send({
          content: `You do not have permission to use the \`${this.commandName}\` command.`,
          ephemeral: true
        });
      }
      case 'throttling': {
        return ctx.send({
          content: `You may not use the \`${this.commandName}\` command again for another ${data.remaining.toFixed(
            1
          )} seconds.`,
          ephemeral: true
        });
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
      return ctx.send({ content: 'An error occurred while running the command.', ephemeral: true });
  }

  /**
   * Called when the command's localization is requesting to be updated.
   */
  onLocaleUpdate(): any {}

  /**
   * Called when the command is being unloaded.
   */
  onUnload(): any {}

  /**
   * Called in order to throttle command usages before running.
   * @param ctx The context being throttled
   */
  async throttle(ctx: CommandContext): Promise<ThrottleResult | null> {
    if (!this.throttling) return null;
    const userID = ctx.user.id;

    let throttle = this._throttles.get(userID);
    if (!throttle || throttle.start + this.throttling.duration * 1000 - Date.now() < 0) {
      if (throttle) clearTimeout(throttle.timeout);
      throttle = {
        start: Date.now(),
        usages: 0,
        timeout: setTimeout(() => this._throttles.delete(userID), this.throttling.duration * 1000)
      };
      this._throttles.set(userID, throttle);
    }

    // Return throttle result if the user has been throttled
    if (throttle.usages + 1 > this.throttling.usages) {
      const retryAfter = (throttle.start + this.throttling.duration * 1000 - Date.now()) / 1000;
      return { retryAfter };
    }
    throttle.usages++;

    return null;
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
   * Runs an autocomplete function.
   * @param ctx The context of the interaction
   */
  async autocomplete(ctx: AutocompleteContext): Promise<any> { // eslint-disable-line @typescript-eslint/no-unused-vars, prettier/prettier
    throw new Error(`${this.constructor.name} doesn't have a autocomplete() method.`);
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
    if (!opts.type || opts.type === ApplicationCommandType.CHAT_INPUT) {
      if (opts.name !== opts.name.toLowerCase()) throw new Error('Command name must be lowercase.');
      if (!/^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u.test(opts.name))
        throw new RangeError(
          'Command name must be between 1-32 characters, matching this regex: /^[-_\'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$/'
        );

      if (typeof opts.description !== 'string') throw new TypeError('Command description must be a string.');
      if (opts.description.length < 1 || opts.description.length > 100)
        throw new RangeError('Command description must be under 100 characters.');

      if (opts.options) {
        if (!Array.isArray(opts.options)) throw new TypeError('Command options must be an array of options.');
        if (opts.options.length > 25) throw new RangeError('Command options cannot exceed 25 options.');

        validateOptions(opts.options);
      }
    } else {
      if (opts.name.length < 1 || opts.name.length > 32)
        throw new RangeError('Command names must be between 1-32 characters.');
    }

    if (opts.requiredPermissions) {
      if (!Array.isArray(opts.requiredPermissions))
        throw new TypeError('Command required permissions must be an Array of permission key strings.');
      for (const perm of opts.requiredPermissions)
        if (!Permissions.FLAGS[perm]) throw new RangeError(`Invalid command required permission: ${perm}`);
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

export const Command = SlashCommand;

/** The options for a {@link SlashCommand}. */
export interface SlashCommandOptions {
  /** The type of command this is. Defaults to chat input, or a regular slash command. */
  type?: ApplicationCommandType;
  /** The name of the command. */
  name: string;
  /** The localiztions for the command name. */
  nameLocalizations?: Record<string, string>;
  /** The description of the command. */
  description?: string;
  /** The localiztions for the command description. */
  descriptionLocalizations?: Record<string, string>;
  /** The guild ID(s) that this command will be assigned to. */
  guildIDs?: string | string[];
  /** The default member permissions required to use the command. Use an empty array to resemble a `false` default permission. */
  requiredPermissions?: string[];
  /** Whether to check the member's permission within command execution, regardless of admin-set command permissions. */
  forcePermissions?: boolean;
  /** The command's options. */
  options?: ApplicationCommandOption[];
  /** The throttling options for the command. */
  throttling?: ThrottlingOptions;
  /** Whether this command is used for unknown commands. */
  unknown?: boolean;
  /** Whether responses from this command should defer ephemeral messages. */
  deferEphemeral?: boolean;
  /**
   * Whether to enable this command in direct messages. `true` by default.
   * @deprecated Use {@link SlashCommandOptions#contexts} instead.
   */
  dmPermission?: boolean;
  /** Whether this command is age-restricted. `false` by default. */
  nsfw?: boolean;
  /** The contexts where this command is available. */
  integrationTypes?: ApplicationIntegrationType[];
  /** The contexts where this command can be used. */
  contexts?: InteractionContextType[];
  /** For entry point commands, whether to have the application or Discord handle this command. */
  handler?: EntryPointHandlerType;
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

/** @private */
export interface ThrottleResult {
  start?: number;
  limit?: number;
  remaining?: number;
  retryAfter: number;
}
