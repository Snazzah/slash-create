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
  InterationResponseType,
  InteractionResponseFlags,
  PartialApplicationCommand
} from './constants';
import SlashCommand from './command';
import TypedEmitter from './util/typedEmitter';
import RequestHandler from './util/requestHandler';
import SlashCreatorAPI from './api';
import Server, { TransformedRequest, RespondFunction, Response } from './server';
import CommandContext from './context';
import { isEqual } from 'lodash';

/**
 * The events typings for the {@link SlashCreator}.
 * @private
 */
interface SlashCreatorEvents {
  ping: () => void;
  synced: () => void;
  rawREST: (request: RawRequest) => void;
  warn: (warning: Error | string) => void;
  debug: (message: string) => void;
  error: (err: Error) => void;
  unverifiedRequest: (treq: TransformedRequest) => void;
  unknownInteraction: (interaction: any) => void;
  commandRegister: (command: SlashCommand, creator: SlashCreator) => void;
  commandUnregister: (command: SlashCommand) => void;
  commandReregister: (command: SlashCommand, oldCommand: SlashCommand) => void;
  commandBlock: (command: SlashCommand, ctx: CommandContext, reason: string, data: any) => void;
  commandError: (command: SlashCommand, err: Error, ctx: CommandContext) => void;
  commandRun: (command: SlashCommand, promise: Promise<any>, ctx: CommandContext) => void;
}

/** The options for the {@link SlashCreator}. */
interface SlashCreatorOptions {
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
  /** Whether to include source in the auto-acknowledgement timeout. */
  autoAcknowledgeSource?: boolean;
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
}

/** The main class for using commands and interactions. */
class SlashCreator extends ((EventEmitter as any) as new () => TypedEmitter<SlashCreatorEvents>) {
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
        autoAcknowledgeSource: false,
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
      throw new Error(`A command with the name "${command.commandName}" is already registered.`);

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
   * Reregisters a command. (does not support changing name, or guild ID)
   * @param command New command
   * @param oldCommand Old command
   */
  reregisterCommand(command: any, oldCommand: SlashCommand) {
    if (typeof command === 'function') command = new command(this);
    else if (typeof command.default === 'function') command = new command.default(this);

    if (!(command instanceof SlashCommand)) throw new Error(`Invalid command object to reregister: ${command}`);

    if (!command.unknown) {
      if (command.commandName !== oldCommand.commandName) throw new Error('Command name cannot change.');
      if (command.guildID !== oldCommand.guildID) throw new Error('Command guild ID cannot change.');
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
        skipGuildErrors: true
      },
      opts
    ) as SyncCommandOptions;

    const promise = async () => {
      const guildIDs: string[] = [];

      // Collect guild IDs with specific commands
      for (const [, command] of this.commands) {
        if (command.guildID && !guildIDs.includes(command.guildID)) guildIDs.push(command.guildID);
      }

      await this.syncGlobalCommands(options.deleteCommands);

      // Sync guild commands
      for (const guildID of guildIDs) {
        try {
          await this.syncCommandsIn(guildID, options.deleteCommands);
        } catch (e) {
          if (options.skipGuildErrors) {
            this.emit(
              'warn',
              `An error occurred during guild sync (${guildID}), you may no longer have access to that guild.`
            );
          } else {
            throw e;
          }
        }
      }

      this.emit('debug', 'Finished syncing commands');
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

    for (const applicationCommand of commands) {
      const partialCommand: PartialApplicationCommand = Object.assign({}, applicationCommand);
      const commandKey = `${guildID}_${partialCommand.name}`;
      delete (partialCommand as any).application_id;
      delete (partialCommand as any).id;

      const command = this.commands.get(commandKey);
      if (command) {
        if (!isEqual(partialCommand, command.commandJSON)) {
          this.emit(
            'debug',
            `Updating guild command "${applicationCommand.name}" (${applicationCommand.id}, guild: ${guildID})`
          );
          await this.api.updateCommand(applicationCommand.id, command.commandJSON, guildID);
        } else {
          this.emit(
            'debug',
            `Guild command "${applicationCommand.name}" (${applicationCommand.id}) synced (guild: ${guildID})`
          );
        }
      } else if (deleteCommands) {
        // Command is removed
        this.emit(
          'debug',
          `Removing guild command "${applicationCommand.name}" (${applicationCommand.id}, guild: ${guildID})`
        );
        await this.api.deleteCommand(applicationCommand.id, guildID);
      }

      handledCommands.push(commandKey);
    }

    const unhandledCommands = this.commands.filter(
      (command) => command.guildID === guildID && !handledCommands.includes(command.keyName)
    );

    for (const [, command] of unhandledCommands) {
      this.emit('debug', `Creating guild command "${command.commandName}" (guild: ${guildID})`);
      await this.api.createCommand(command.commandJSON, guildID);
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

    for (const applicationCommand of commands) {
      const partialCommand: PartialApplicationCommand = Object.assign({}, applicationCommand);
      const commandKey = `global_${partialCommand.name}`;
      delete (partialCommand as any).application_id;
      delete (partialCommand as any).id;

      const command = this.commands.get(commandKey);
      if (command) {
        if (!isEqual(partialCommand, command.commandJSON)) {
          this.emit('debug', `Updating command "${applicationCommand.name}" (${applicationCommand.id})`);
          await this.api.updateCommand(applicationCommand.id, command.commandJSON);
        } else {
          this.emit('debug', `Command "${applicationCommand.name}" (${applicationCommand.id}) synced`);
        }
      } else if (deleteCommands) {
        this.emit('debug', `Removing command "${applicationCommand.name}" (${applicationCommand.id})`);
        await this.api.deleteCommand(applicationCommand.id);
      }

      handledCommands.push(commandKey);
    }

    const unhandledCommands = this.commands.filter(
      (command) => !command.guildID && !handledCommands.includes(command.keyName)
    );

    for (const [, command] of unhandledCommands) {
      this.emit('debug', `Creating command "${command.commandName}"`);
      await this.api.createCommand(command.commandJSON);
    }
  }

  private _getCommand(commandName: string, guildID: string) {
    return this.commands.get(`${guildID}_${commandName}`) || this.commands.get(`global_${commandName}`);
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

    return this._onInteraction(treq.body, respond, true);
  }

  private async _onInteraction(interaction: AnyRequestData, respond: RespondFunction | null, webserverMode: boolean) {
    this.emit('debug', 'Got interaction');

    if (!respond || !webserverMode) respond = this._createGatewayRespond(interaction.id, interaction.token);

    switch (interaction.type) {
      case InteractionType.PING: {
        this.emit('debug', 'Ping recieved');
        this.emit('ping');
        return respond({
          status: 200,
          body: {
            type: InterationResponseType.PONG
          }
        });
      }
      case InteractionType.COMMAND: {
        const command = this._getCommand(interaction.data.name, interaction.guild_id);

        if (!command) {
          this.emit(
            'debug',
            `Unknown command: ${interaction.data.name} (${interaction.data.id}, guild ${interaction.guild_id})`
          );
          if (this.unknownCommand) {
            const ctx = new CommandContext(this, interaction, respond, webserverMode);
            return this._runCommand(this.unknownCommand, ctx);
          } else if (this.options.unknownCommandResponse)
            return respond({
              status: 200,
              body: {
                type: InterationResponseType.CHANNEL_MESSAGE,
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
              status: 200,
              body: {
                type: InterationResponseType.ACKNOWLEDGE
              }
            });
        } else {
          const ctx = new CommandContext(this, interaction, respond, webserverMode);

          // Ensure the user has permission to use the command
          const hasPermission = command.hasPermission(ctx);
          if (!hasPermission || typeof hasPermission === 'string') {
            const data = { response: typeof hasPermission === 'string' ? hasPermission : undefined };
            this.emit('commandBlock', command, ctx, 'permission', data);
            return command.onBlock(ctx, 'permission', data);
          }

          // Throttle the command
          const throttle = command.throttle(ctx.member.id);
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
      default: {
        // @ts-ignore
        this.emit('debug', `Unknown interaction type recieved: ${interaction.type}`);
        this.emit('unknownInteraction', interaction);
        return respond({
          status: 400
        });
      }
    }
  }

  private async _runCommand(command: SlashCommand, ctx: CommandContext) {
    try {
      this.emit('debug', `Running command: ${ctx.data.data.name} (${ctx.data.data.id}, guild ${ctx.data.guild_id})`);
      const promise = command.run(ctx);
      this.emit('commandRun', command, promise, ctx);
      const retVal = await promise;
      if (
        !(
          retVal === undefined ||
          retVal === null ||
          typeof retVal === 'string' ||
          (retVal && retVal.constructor && retVal.constructor.name === 'Object')
        )
      ) {
        throw new TypeError(oneLine`
          Command ${command.commandName}'s run() resolved with an unknown type
          (${retVal !== null ? (retVal && retVal.constructor ? retVal.constructor.name : typeof retVal) : null}).
          Command run methods must return a Promise that resolve with a string, Message options, or null/undefined.
        `);
      }
      return command.finalize(retVal, ctx);
    } catch (err) {
      this.emit('commandError', command, err, ctx);
      try {
        return command.onError(err, ctx);
      } catch (secondErr) {
        return this.emit('error', secondErr);
      }
    }
  }

  private _createGatewayRespond(interactionID: string, token: string): RespondFunction {
    return async (response: Response) => {
      await this.api.interactionCallback(interactionID, token, response.body);
    };
  }
}

export default SlashCreator;
