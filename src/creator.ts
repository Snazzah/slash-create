import EventEmitter from 'eventemitter3';
import Collection from '@discordjs/collection';
import HTTPS from 'https';
import { formatAllowedMentions, FormattedAllowedMentions, MessageAllowedMentions, oneLine, verifyKey } from './util';
import {
  ImageFormat,
  InteractionType,
  AnyRequestData,
  RawRequest,
  RequireAllOptions,
  InteractionResponseType,
  InteractionResponseFlags,
  PartialApplicationCommand,
  BulkUpdateCommand,
  CommandUser,
  InteractionRequestData,
  PartialApplicationCommandPermissions,
  ApplicationCommandType,
  CommandAutocompleteRequestData
} from './constants';
import { SlashCommand } from './command';
import { TypedEventEmitter } from './util/typedEmitter';
import { RequestHandler } from './util/requestHandler';
import { SlashCreatorAPI } from './api';
import { Server, TransformedRequest, RespondFunction, Response } from './server';
import { CommandContext } from './structures/interfaces/commandContext';
import isEqual from 'lodash.isequal';
import uniq from 'lodash.uniq';
import { ComponentContext } from './structures/interfaces/componentContext';
import { AutocompleteContext } from './structures/interfaces/autocompleteContext';

/** The main class for using commands and interactions. */
export class SlashCreator extends (EventEmitter as any as new () => TypedEventEmitter<SlashCreatorEvents>) {
  /** The options from constructing the creator */
  options: SlashCreatorOptions;
  /** The request handler for the creator */
  readonly requestHandler: RequestHandler;
  /** The API handler for the creator */
  readonly api = new SlashCreatorAPI(this);
  /** The commands loaded onto the creator */
  readonly commands = new Collection<string, SlashCommand>();
  /**
   * The path where the commands were loaded from
   * @see #registerCommandsIn
   */
  commandsPath?: string;
  /** The server being used in the creator */
  server?: Server;
  /** The formatted allowed mentions from the options */
  readonly allowedMentions: FormattedAllowedMentions;
  /** The command to run when an unknown command is used. */
  unknownCommand?: SlashCommand;

  /** @hidden */
  _componentCallbacks = new Map<string, ComponentCallback>();

  /** @param opts The options for the creator */
  constructor(opts: SlashCreatorOptions) {
    // eslint-disable-next-line constructor-super
    super();

    if (!opts.applicationID) throw new Error('An application ID must be defined!');
    if (opts.token && !opts.token.startsWith('Bot ') && !opts.token.startsWith('Bearer '))
      opts.token = 'Bot ' + opts.token;

    // Define default options
    this.options = Object.assign(
      {
        agent: null,
        allowedMentions: {
          users: true,
          roles: true
        },
        defaultImageFormat: 'jpg',
        defaultImageSize: 128,
        unknownCommandResponse: true,
        handleCommandsManually: false,
        latencyThreshold: 30000,
        ratelimiterOffset: 0,
        requestTimeout: 15000,
        maxSignatureTimestamp: 5000,
        endpointPath: '/interactions',
        serverPort: 8030,
        serverHost: 'localhost'
      },
      opts
    );

    this.allowedMentions = formatAllowedMentions(this.options.allowedMentions as MessageAllowedMentions);

    this.requestHandler = new RequestHandler(this);
    this.api = new SlashCreatorAPI(this);
  }

  /**
   * Registers a single command
   * @param command Either a Command instance, or a constructor for one
   * @see SlashCreator#registerCommands
   */
  registerCommand(command: any) {
    if (typeof command === 'function') command = new command(this);
    else if (typeof command.default === 'function') command = new command.default(this);

    if (!(command instanceof SlashCommand)) throw new Error(`Invalid command object to register: ${command}`);

    // Make sure there aren't any conflicts
    if (this.commands.some((cmd) => cmd.keyName === command.keyName))
      throw new Error(`A command with the name "${command.commandName}" (${command.keyName}) is already registered.`);
    if (
      command.guildIDs &&
      this.commands.some(
        (cmd) =>
          !!(
            cmd.type === command.type &&
            cmd.commandName === command.commandName &&
            cmd.guildIDs &&
            cmd.guildIDs.map((gid) => command.guildIDs.includes(gid)).includes(true)
          )
      )
    )
      throw new Error(`A command with the name "${command.commandName}" has a conflicting guild ID.`);

    if (command.unknown && this.unknownCommand) throw new Error('An unknown command is already registered.');

    if (command.unknown) this.unknownCommand = command;
    else this.commands.set(command.keyName, command);

    this.emit('commandRegister', command, this);
    this.emit('debug', `Registered command ${command.keyName}.`);

    return this;
  }

  /**
   * Registers multiple commands
   * @param commands An array of Command instances or constructors
   * @param ignoreInvalid Whether to skip over invalid objects without throwing an error
   */
  registerCommands(commands: any[], ignoreInvalid = false) {
    if (!Array.isArray(commands)) throw new TypeError('Commands must be an Array.');
    for (const command of commands) {
      const valid =
        typeof command === 'function' ||
        typeof command.default === 'function' ||
        command instanceof SlashCommand ||
        command.default instanceof SlashCommand;
      if (ignoreInvalid && !valid) {
        this.emit('warn', `Attempting to register an invalid command object: ${command}; skipping.`);
        continue;
      }
      this.registerCommand(command);
    }
    return this;
  }

  /**
   * Registers all commands in a directory. The files must export a Command class constructor or instance.
   * @param options The path to the directory, or a require-all options object
   * @example
   * const path = require('path');
   * creator.registerCommandsIn(path.join(__dirname, 'commands'));
   */
  registerCommandsIn(options: RequireAllOptions | string) {
    const obj: { [key: string]: any } = require('require-all')(options);
    const commands: any[] = [];
    function iterate(obj: any) {
      for (const command of Object.values(obj)) {
        if (typeof command === 'function') commands.push(command);
        else if (typeof command === 'object') iterate(command);
      }
    }
    iterate(obj);
    if (typeof options === 'string' && !this.commandsPath) this.commandsPath = options;
    else if (typeof options === 'object' && !this.commandsPath) this.commandsPath = options.dirname;
    return this.registerCommands(commands, true);
  }

  /**
   * Reregisters a command. (does not support changing name, or guild IDs)
   * @param command New command
   * @param oldCommand Old command
   */
  reregisterCommand(command: any, oldCommand: SlashCommand) {
    if (typeof command === 'function') command = new command(this);
    else if (typeof command.default === 'function') command = new command.default(this);

    if (!(command instanceof SlashCommand)) throw new Error(`Invalid command object to reregister: ${command}`);

    oldCommand.onUnload();

    if (!command.unknown) {
      if (command.commandName !== oldCommand.commandName) throw new Error('Command name cannot change.');
      if (!isEqual(command.guildIDs, oldCommand.guildIDs)) throw new Error('Command guild IDs cannot change.');
      this.commands.set(command.keyName, command);
    } else if (this.unknownCommand !== oldCommand) {
      throw new Error('An unknown command is already registered.');
    } else {
      this.unknownCommand = command;
    }

    this.emit('commandReregister', command, oldCommand);
    this.emit('debug', `Reregistered command ${command.keyName}.`);
  }

  /**
   * Unregisters a command.
   * @param command Command to unregister
   */
  unregisterCommand(command: SlashCommand) {
    command.onUnload();
    if (this.unknownCommand === command) this.unknownCommand = undefined;
    else this.commands.delete(command.keyName);
    this.emit('commandUnregister', command);
    this.emit('debug', `Unregistered command ${command.keyName}.`);
  }

  /**
   * Attaches a server to the creator.
   * @param server The server to use
   */
  withServer(server: Server) {
    if (this.server) throw new Error('A server was already set in this creator.');
    this.server = server;

    if (this.server.isWebserver) {
      if (!this.options.publicKey) throw new Error('A public key is required to be set when using a webserver.');
      this.server.createEndpoint(this.options.endpointPath as string, this._onRequest.bind(this));
    } else this.server.handleInteraction((interaction) => this._onInteraction(interaction, null, false));

    return this;
  }

  /** Starts the server, if one was defined. */
  async startServer() {
    if (!this.server) throw new Error('No server was set in this creator.');

    await this.server.listen(this.options.serverPort, this.options.serverHost);
    this.emit('debug', 'Server started');
  }

  /**
   * Sync all commands with Discord. This ensures that commands exist when handling them.
   * <warn>This requires you to have your token set in the creator config.</warn>
   */
  syncCommands(opts?: SyncCommandOptions) {
    const options = Object.assign(
      {
        deleteCommands: true,
        syncGuilds: true,
        skipGuildErrors: true,
        syncPermissions: true
      },
      opts
    ) as SyncCommandOptions;

    const promise = async () => {
      let guildIDs: string[] = [];

      // Collect guild IDs with specific commands
      for (const [, command] of this.commands) {
        if (command.guildIDs) guildIDs = uniq([...guildIDs, ...command.guildIDs]);
      }

      await this.syncGlobalCommands(options.deleteCommands);

      // Sync guild commands
      for (const guildID of guildIDs) {
        try {
          await this.syncCommandsIn(guildID, options.deleteCommands);
        } catch (e) {
          if (options.skipGuildErrors) {
            this.emit('warn', `An error occurred during guild sync (${guildID}): ${(e as Error).message}`);
          } else {
            throw e;
          }
        }
      }

      this.emit('debug', 'Finished syncing commands');

      if (options.syncPermissions)
        try {
          await this.syncCommandPermissions();
        } catch (e) {
          this.emit('error', e as Error);
        }
    };

    promise()
      .then(() => this.emit('synced'))
      .catch((err) => this.emit('error', err));
    return this;
  }

  /**
   * Sync guild commands.
   * <warn>This requires you to have your token set in the creator config.</warn>
   * @param guildID The guild to sync
   * @param deleteCommands Whether to delete command not found in the creator
   */
  async syncCommandsIn(guildID: string, deleteCommands = true) {
    const commands = await this.api.getCommands(guildID);
    const handledCommands: string[] = [];
    const updatePayload: BulkUpdateCommand[] = [];

    for (const applicationCommand of commands) {
      const partialCommand: PartialApplicationCommand = Object.assign({}, applicationCommand);
      delete (partialCommand as any).application_id;
      delete (partialCommand as any).guild_id;
      delete (partialCommand as any).id;
      delete (partialCommand as any).version;

      const command = this.commands.find(
        (command) =>
          !!(
            command.guildIDs &&
            command.guildIDs.includes(guildID) &&
            command.commandName === partialCommand.name &&
            command.type === partialCommand.type
          )
      );
      if (command) {
        command.ids.set(guildID, applicationCommand.id);
        this.emit(
          'debug',
          `Found guild command "${applicationCommand.name}" (${applicationCommand.id}, type ${applicationCommand.type}, guild: ${guildID})`
        );
        updatePayload.push({
          id: applicationCommand.id,
          ...command.commandJSON
        });
        handledCommands.push(command.keyName);
      } else if (deleteCommands) {
        this.emit(
          'debug',
          `Removing guild command "${applicationCommand.name}" (${applicationCommand.id}, type ${applicationCommand.type}, guild: ${guildID})`
        );
      } else {
        updatePayload.push(applicationCommand);
      }
    }

    const commandsPayload = commands.map((cmd) => {
      delete (cmd as any).application_id;
      delete (cmd as any).guild_id;
      delete (cmd as any).version;
      return cmd;
    });

    const unhandledCommands = this.commands.filter(
      (command) =>
        !!(command.guildIDs && command.guildIDs.includes(guildID) && !handledCommands.includes(command.keyName))
    );

    for (const [, command] of unhandledCommands) {
      this.emit('debug', `Creating guild command "${command.commandName}" (type ${command.type}, guild: ${guildID})`);
      updatePayload.push({
        ...command.commandJSON
      });
    }

    if (!isEqual(updatePayload, commandsPayload)) {
      // Set command IDs for permission syncing
      const updatedCommands = await this.api.updateCommands(updatePayload, guildID);
      const newCommands = updatedCommands.filter(
        (newCommand) => !commands.find((command) => command.id === newCommand.id)
      );
      for (const newCommand of newCommands) {
        const command = unhandledCommands.find((command) => command.commandName === newCommand.name);
        if (command) command.ids.set(guildID, newCommand.id);
      }
    }
  }

  /**
   * Sync global commands.
   * <warn>This requires you to have your token set in the creator config.</warn>
   * @param deleteCommands Whether to delete command not found in the creator
   */
  async syncGlobalCommands(deleteCommands = true) {
    const commands = await this.api.getCommands();
    const handledCommands: string[] = [];
    const updatePayload: BulkUpdateCommand[] = [];

    for (const applicationCommand of commands) {
      const partialCommand: PartialApplicationCommand = Object.assign({}, applicationCommand);
      const commandKey = `${partialCommand.type || ApplicationCommandType.CHAT_INPUT}:global:${partialCommand.name}`;
      delete (partialCommand as any).application_id;
      delete (partialCommand as any).id;
      delete (partialCommand as any).version;

      const command = this.commands.get(commandKey);
      if (command) {
        command.ids.set('global', applicationCommand.id);
        this.emit(
          'debug',
          `Found command "${applicationCommand.name}" (${applicationCommand.id}, type ${applicationCommand.type})`
        );
        updatePayload.push({
          id: applicationCommand.id,
          ...command.commandJSON
        });
      } else if (deleteCommands) {
        this.emit(
          'debug',
          `Removing command "${applicationCommand.name}" (${applicationCommand.id}, type ${applicationCommand.type})`
        );
      } else {
        updatePayload.push(applicationCommand);
      }

      handledCommands.push(commandKey);
    }

    const commandsPayload = commands.map((cmd) => {
      delete (cmd as any).application_id;
      delete (cmd as any).version;
      return cmd;
    });

    const unhandledCommands = this.commands.filter(
      (command) => !command.guildIDs && !handledCommands.includes(command.keyName)
    );

    for (const [, command] of unhandledCommands) {
      this.emit('debug', `Creating command "${command.commandName}" (type ${command.type})`);
      updatePayload.push({
        ...command.commandJSON
      });
    }

    if (!isEqual(updatePayload, commandsPayload)) {
      const updatedCommands = await this.api.updateCommands(updatePayload);
      const newCommands = updatedCommands.filter(
        (newCommand) => !commands.find((command) => command.id === newCommand.id)
      );
      for (const newCommand of newCommands) {
        const command = unhandledCommands.find((command) => command.commandName === newCommand.name);
        if (command) command.ids.set('global', newCommand.id);
      }
    }
  }

  /**
   * Sync command permissions.
   * <warn>This requires you to have your token set in the creator config AND have commands already synced previously.</warn>
   */
  async syncCommandPermissions() {
    const guildPayloads: { [guildID: string]: PartialApplicationCommandPermissions[] } = {};

    for (const [, command] of this.commands) {
      if (command.permissions) {
        for (const guildID in command.permissions) {
          const commandID = command.ids.get(guildID) || command.ids.get('global');
          if (!commandID) continue;
          if (!(guildID in guildPayloads)) guildPayloads[guildID] = [];
          guildPayloads[guildID].push({
            id: commandID,
            permissions: command.permissions[guildID]
          });
        }
      }
    }

    for (const guildID in guildPayloads) await this.api.bulkUpdateCommandPermissions(guildID, guildPayloads[guildID]);
  }

  /**
   * Updates the command IDs internally in the creator.
   * Use this if you make any changes to commands in the API.
   * @param skipGuildErrors Whether to prevent throwing an error if the API failed to get guild commands
   */
  async collectCommandIDs(skipGuildErrors = true) {
    let guildIDs: string[] = [];
    for (const [, command] of this.commands) {
      if (command.guildIDs) guildIDs = uniq([...guildIDs, ...command.guildIDs]);
    }

    const commands = await this.api.getCommands();

    for (const applicationCommand of commands) {
      const commandKey = `${applicationCommand.type}:global:${applicationCommand.name}`;
      const command = this.commands.get(commandKey);
      if (command) command.ids.set('global', applicationCommand.id);
    }

    for (const guildID of guildIDs) {
      try {
        const commands = await this.api.getCommands(guildID);

        for (const applicationCommand of commands) {
          const command = this.commands.find(
            (command) =>
              !!(
                command.guildIDs &&
                command.guildIDs.includes(guildID) &&
                command.commandName === applicationCommand.name &&
                command.type === applicationCommand.type
              )
          );
          if (command) command.ids.set(guildID, applicationCommand.id);
        }
      } catch (e) {
        if (skipGuildErrors) {
          this.emit('warn', `An error occurred during guild command ID collection (${guildID}): ${e}`);
        } else {
          throw e;
        }
      }
    }
  }

  /**
   * Registers a global component callback. Note that this will have no expiration, and should be invoked by the returned name.
   * @param custom_id The custom ID of the component to register
   * @param callback The callback to use on interaction
   */
  registerGlobalComponent(custom_id: string, callback: ComponentRegisterCallback) {
    const newName = `global-${custom_id}`;
    if (this._componentCallbacks.has(newName))
      throw new Error(`A global component with the ID "${newName}" is already registered.`);
    this._componentCallbacks.set(newName, {
      callback,
      expires: undefined,
      onExpired: undefined
    });
  }

  /**
   * Unregisters a global component callback.
   * @param custom_id The custom ID of the component to unregister
   */
  unregisterGlobalComponent(custom_id: string) {
    return this._componentCallbacks.delete(`global-${custom_id}`);
  }

  /**
   * Cleans any awaiting component callbacks from command contexts.
   */
  cleanRegisteredComponents() {
    if (this._componentCallbacks.size)
      for (const [key, callback] of this._componentCallbacks) {
        if (callback.expires != null && callback.expires < Date.now()) {
          if (callback.onExpired != null) callback.onExpired();
          this._componentCallbacks.delete(key);
        }
      }
  }

  private _getCommandFromInteraction(interaction: InteractionRequestData | CommandAutocompleteRequestData) {
    return 'guild_id' in interaction
      ? this.commands.find(
          (command) =>
            !!(
              command.guildIDs &&
              command.guildIDs.includes(interaction.guild_id) &&
              command.commandName === interaction.data.name &&
              command.type === interaction.data.type
            )
        ) || this.commands.get(`${interaction.data.type}:global:${interaction.data.name}`)
      : this.commands.get(`${interaction.data.type}:global:${interaction.data.name}`);
  }

  private async _onRequest(treq: TransformedRequest, respond: RespondFunction) {
    this.emit('debug', 'Got request');

    // Verify request
    const signature = treq.headers['x-signature-ed25519'] as string;
    const timestamp = treq.headers['x-signature-timestamp'] as string;

    // Check if both signature and timestamp exists, and the timestamp isn't past due.
    if (
      !signature ||
      !timestamp ||
      parseInt(timestamp) < (Date.now() - (this.options.maxSignatureTimestamp as number)) / 1000
    )
      return respond({
        status: 401,
        body: 'Invalid signature'
      });

    const verified = await verifyKey(JSON.stringify(treq.body), signature, timestamp, this.options.publicKey as string);

    if (!verified) {
      this.emit('debug', 'A request failed to be verified');
      this.emit('unverifiedRequest', treq);
      return respond({
        status: 401,
        body: 'Invalid signature'
      });
    }

    try {
      await this._onInteraction(treq.body, respond, true);
    } catch (e) {}
  }

  private async _onInteraction(interaction: AnyRequestData, respond: RespondFunction | null, webserverMode: boolean) {
    this.emit('rawInteraction', interaction);

    if (!respond || !webserverMode) respond = this._createGatewayRespond(interaction.id, interaction.token);

    switch (interaction.type) {
      case InteractionType.PING: {
        this.emit('debug', 'Ping received');
        this.emit('ping', interaction.user);
        return respond({
          status: 200,
          body: {
            type: InteractionResponseType.PONG
          }
        });
      }
      case InteractionType.APPLICATION_COMMAND: {
        if (this.options.handleCommandsManually) {
          this.emit('commandInteraction', interaction, respond, webserverMode);
          return;
        }

        const command = this._getCommandFromInteraction(interaction);

        if (!command) {
          this.emit(
            'debug',
            `Unknown command: ${interaction.data.name} (${interaction.data.id}, ${
              'guild_id' in interaction ? `guild ${interaction.guild_id}` : `user ${interaction.user.id}`
            })`
          );
          if (this.unknownCommand) {
            const ctx = new CommandContext(
              this,
              interaction,
              respond,
              webserverMode,
              this.unknownCommand.deferEphemeral
            );
            return this._runCommand(this.unknownCommand, ctx);
          } else if (this.options.unknownCommandResponse)
            return respond({
              status: 200,
              body: {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: oneLine`
                    This command no longer exists.
                    This command should no longer show up in an hour if it has been deleted.
                  `,
                  flags: InteractionResponseFlags.EPHEMERAL
                }
              }
            });
          else
            return respond({
              status: 400
            });
        } else {
          const ctx = new CommandContext(this, interaction, respond, webserverMode, command.deferEphemeral);

          // Ensure the user has permission to use the command
          const hasPermission = command.hasPermission(ctx);
          if (!hasPermission || typeof hasPermission === 'string') {
            const data = { response: typeof hasPermission === 'string' ? hasPermission : undefined };
            this.emit('commandBlock', command, ctx, 'permission', data);
            return command.onBlock(ctx, 'permission', data);
          }

          // Throttle the command
          const throttle = command.throttle(ctx.user.id);
          if (throttle && command.throttling && throttle.usages + 1 > command.throttling.usages) {
            const remaining = (throttle.start + command.throttling.duration * 1000 - Date.now()) / 1000;
            const data = { throttle, remaining };
            this.emit('commandBlock', command, ctx, 'throttling', data);
            return command.onBlock(ctx, 'throttling', data);
          }

          // Run the command
          if (throttle) throttle.usages++;
          return this._runCommand(command, ctx);
        }
      }
      case InteractionType.MESSAGE_COMPONENT: {
        this.emit(
          'debug',
          `Component request received: ${interaction.data.custom_id}, (msg ${interaction.message.id}, ${
            'guild_id' in interaction ? `guild ${interaction.guild_id}` : `user ${interaction.user.id}`
          })`
        );

        if (this._componentCallbacks.size || this.listenerCount('componentInteraction') > 0) {
          const ctx = new ComponentContext(this, interaction, respond);
          this.emit('componentInteraction', ctx);

          this.cleanRegisteredComponents();

          const componentCallbackKey = `${ctx.message.id}-${ctx.customID}`;
          const globalCallbackKey = `global-${ctx.customID}`;
          const wildcardCallbackKey = `${ctx.message.id}-*`;

          if (this._componentCallbacks.has(componentCallbackKey))
            return this._componentCallbacks.get(componentCallbackKey)!.callback(ctx);
          if (this._componentCallbacks.has(globalCallbackKey))
            return this._componentCallbacks.get(globalCallbackKey)!.callback(ctx);
          if (this._componentCallbacks.has(wildcardCallbackKey))
            return this._componentCallbacks.get(wildcardCallbackKey)!.callback(ctx);
          break;
        } else
          return respond({
            status: 200,
            body: {
              type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
            }
          });
      }
      case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE: {
        const command = this._getCommandFromInteraction(interaction);
        const ctx = new AutocompleteContext(this, interaction, respond);
        this.emit('autocompleteInteraction', ctx, command);

        if (!command) {
          this.emit(
            'debug',
            `Unknown command autocomplete request: ${interaction.data.name} (${interaction.data.id}, ${
              'guild_id' in interaction ? `guild ${interaction.guild_id}` : `user ${interaction.user.id}`
            })`
          );
          return respond({
            status: 400
          });
        } else {
          try {
            this.emit(
              'debug',
              `Running autocomplete function: ${interaction.data.name} (${interaction.data.id}, ${
                'guild_id' in interaction ? `guild ${interaction.guild_id}` : `user ${interaction.user.id}`
              })`
            );
            const retVal = await command.autocomplete(ctx);
            if (Array.isArray(retVal) && !ctx.responded) await ctx.sendResults(retVal);
            return;
          } catch (err) {
            return this.emit('error', err as Error);
          }
        }
      }
      default: {
        // @ts-ignore
        this.emit('debug', `Unknown interaction type received: ${interaction.type}`);
        this.emit('unknownInteraction', interaction);
        return respond({
          status: 400
        });
      }
    }
  }

  private async _runCommand(command: SlashCommand, ctx: CommandContext) {
    try {
      this.emit(
        'debug',
        `Running command: ${ctx.data.data.name} (${ctx.data.data.id}, ${
          'guild_id' in ctx.data ? `guild ${ctx.data.guild_id}` : `user ${ctx.data.user.id}`
        })`
      );
      const promise = command.run(ctx);
      this.emit('commandRun', command, promise, ctx);
      const retVal = await promise;
      if (retVal) return command.finalize(retVal, ctx);
    } catch (err) {
      this.emit('commandError', command, err as Error, ctx);
      try {
        return command.onError(err as Error, ctx);
      } catch (secondErr) {
        return this.emit('error', secondErr as Error);
      }
    }
  }

  private _createGatewayRespond(interactionID: string, token: string): RespondFunction {
    return async (response: Response) => {
      await this.api.interactionCallback(interactionID, token, response.body);
    };
  }
}

export const Creator = SlashCreator;

/**
 * The events typings for the {@link SlashCreator}.
 * @private
 */
interface SlashCreatorEvents {
  ping: (user?: CommandUser) => void;
  synced: () => void;
  rawREST: (request: RawRequest) => void;
  warn: (warning: Error | string) => void;
  debug: (message: string) => void;
  error: (err: Error) => void;
  unverifiedRequest: (treq: TransformedRequest) => void;
  unknownInteraction: (interaction: any) => void;
  rawInteraction: (interaction: AnyRequestData) => void;
  commandInteraction: (interaction: InteractionRequestData, respond: RespondFunction, webserverMode: boolean) => void;
  componentInteraction: (ctx: ComponentContext) => void;
  autocompleteInteraction: (ctx: AutocompleteContext, command?: SlashCommand) => void;
  commandRegister: (command: SlashCommand, creator: SlashCreator) => void;
  commandUnregister: (command: SlashCommand) => void;
  commandReregister: (command: SlashCommand, oldCommand: SlashCommand) => void;
  commandBlock: (command: SlashCommand, ctx: CommandContext, reason: string, data: any) => void;
  commandError: (command: SlashCommand, err: Error, ctx: CommandContext) => void;
  commandRun: (command: SlashCommand, promise: Promise<any>, ctx: CommandContext) => void;
}

/** The options for the {@link SlashCreator}. */
export interface SlashCreatorOptions {
  /** Your Application's ID */
  applicationID: string;
  /**
   * The public key for your application.
   * Required for webservers.
   */
  publicKey?: string;
  /**
   * The bot/client token for the application.
   * Recommended to set this in your config.
   */
  token?: string;
  /** The path where the server will listen for interactions. */
  endpointPath?: string;
  /** The port where the server will listen on. */
  serverPort?: number;
  /** The host where the server will listen on. */
  serverHost?: string;
  /**
   * Whether to respond to an unknown command with an ephemeral message.
   * If an unknown command is registered, this is ignored.
   */
  unknownCommandResponse?: boolean;
  /**
   * Whether to hand off command interactions to the `commandInteraction` event
   * rather than handle it automatically.
   */
  handleCommandsManually?: boolean;
  /** The default allowed mentions for all messages. */
  allowedMentions?: MessageAllowedMentions;
  /** The default format to provide user avatars in. */
  defaultImageFormat?: ImageFormat;
  /** The default image size to provide user avatars in. */
  defaultImageSize?: number;
  /** The average latency where SlashCreate will start emitting warnings for. */
  latencyThreshold?: number;
  /** A number of milliseconds to offset the ratelimit timing calculations by. */
  ratelimiterOffset?: number;
  /** A number of milliseconds before requests are considered timed out. */
  requestTimeout?: number;
  /** A number of milliseconds before requests with a timestamp past that time get rejected. */
  maxSignatureTimestamp?: number;
  /** A HTTP Agent used to proxy requests */
  agent?: HTTPS.Agent;
}

/** The options for {@link SlashCreator#syncCommands}. */
interface SyncCommandOptions {
  /** Whether to delete commands that do not exist in the creator. */
  deleteCommands?: boolean;
  /** Whether to sync guild-specific commands. */
  syncGuilds?: boolean;
  /**
   * Whether to skip over guild syncing errors.
   * Guild syncs most likely can error if that guild no longer exists.
   */
  skipGuildErrors?: boolean;
  /** Whether to sync command permissions after syncing commands. */
  syncPermissions?: boolean;
}

/** A component callback from {@see MessageInteractionContext#registerComponent}. */
export type ComponentRegisterCallback = (ctx: ComponentContext) => void;

/** @hidden */
interface ComponentCallback {
  callback: ComponentRegisterCallback;
  expires?: number;
  onExpired?: () => void;
}
