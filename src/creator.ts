import EventEmitter from 'eventemitter3';
import TypedEmitter from 'typed-emitter';
import Collection from '@discordjs/collection';
import HTTPS from 'https';
import { formatAllowedMentions, FormattedAllowedMentions, MessageAllowedMentions, oneLine, verifyKey } from './util';
import {
  ImageFormat,
  InteractionType,
  AllRequestData,
  RawRequest,
  RequireAllOptions,
  InterationResponseType,
  InteractionResponseFlags,
  PartialApplicationCommand
} from './constants';
import SlashCommand from './command';
import RequestHandler from './util/requestHandler';
import SlashCreatorAPI from './api';
import Server, { TransformedRequest, RespondFunction } from './server';
import CommandContext from './context';

interface SlashCreatorEvents {
  /**
   * Emitted when Discord pings the interaction endpoint.
   * @event SlashCreator#ping
   * @param treq The request
   */
  ping: (treq: TransformedRequest) => void;
  /**
   * Emitted when the creator successfully synced commands.
   */
  synced: () => void;
  /**
   * Emitted when the Client's RequestHandler receives a response.
   * @event SlashCreator#rawREST
   * @prop {Object} [request] The data for the request
   * @prop {Boolean} request.auth True if the request required an authorization token
   * @prop {Object} [request.body] The request payload
   * @prop {String} request.method Uppercase HTTP method
   * @prop {IncomingMessage} request.resp The HTTP response to the request
   * @prop {String} request.route The calculated ratelimiting route for the request
   * @prop {Boolean} request.short Whether or not the request was prioritized in its ratelimiting queue
   * @prop {String} request.url URL of the endpoint
   */
  rawREST: (request: RawRequest) => void;
  /**
   * Emitted when a warning is given.
   * @event SlashCreator#rawREST
   * @param warning The warning
   */
  warn: (warning: Error | string) => void;
  /**
   * Emitted when a debug message is given.
   * @event SlashCreator#warn
   * @param message The debug message
   */
  debug: (message: string) => void;
  /**
   * Emitted when an error occurred
   * @event SlashCreator#error
   * @param err The error thrown
   */
  error: (err: Error) => void;
  /**
   * Emitted when a request failed to be verified.
   * @event SlashCreator#unverifiedRequest
   * @param treq The unverified request
   */
  unverifiedRequest: (treq: TransformedRequest) => void;
  /**
   * Emitted when an unknown interaction type is encountered.
   * @event SlashCreator#unknownInteraction
   * @param treq The request
   */
  unknownInteraction: (treq: TransformedRequest) => void;
  /**
   * Emitted when a command is registered.
   * @event SlashCreator#commandRegister
   * @param command Command that was registered
   * @param creator Creator that the command was registered to
   */
  commandRegister: (command: SlashCommand, creator: SlashCreator) => void;
  /**
   * Emitted when a command is blocked.
   * @event SlashCreator#commandBlock
   * @param command Command that was blocked
   * @param ctx The context of the interaction
   * @param reason Reason that the command was blocked
   * @param data Additional data associated with the block.
   */
  commandBlock: (command: SlashCommand, ctx: CommandContext, reason: string, data: any) => void;
  /**
   * Emitted when a command gave an error.
   * @event SlashCreator#commandError
   * @param command Command that gave an error
   * @param err The error given
   * @param ctx The context of the interaction
   */
  commandError: (command: SlashCommand, err: Error, ctx: CommandContext) => void;
  /**
   * Emitted when a command is ran.
   * @event SlashCreator#commandRun
   * @param command Command that was ran
   * @param promise Promise for the command result
   * @param ctx The context of the interaction
   */
  commandRun: (command: SlashCommand, promise: Promise<any>, ctx: CommandContext) => void;
}

interface SlashCreatorOptions {
  /** Your Application's ID */
  applicationID: string;
  /** The public key for your application */
  publicKey: string;
  /** The bot/client token for the application. Recommended to set. */
  token?: string;
  /** The path where the server will listen for interactions. */
  endpointPath?: string;
  /** The port where the server will listen on. */
  serverPort?: number;
  /** The host where the server will listen on. */
  serverHost?: string;
  /** Whether to respond to an unknown command with an ephemeral message. */
  unknownCommandResponse?: boolean;
  /** The default allowed mentions for all messages */
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

class SlashCreator extends ((EventEmitter as any) as new () => TypedEmitter<SlashCreatorEvents>) {
  options: SlashCreatorOptions;
  readonly requestHandler: RequestHandler;
  readonly api: SlashCreatorAPI;
  readonly commands = new Collection<string, SlashCommand>();
  commandsPath?: string;
  server?: Server;
  allowedMentions: FormattedAllowedMentions;

  constructor(opts: SlashCreatorOptions) {
    // eslint-disable-next-line constructor-super
    super();

    if (!opts.applicationID) throw new Error('An application ID must be defined!');
    if (!opts.publicKey) throw new Error('A public key must be defined!');
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
        latencyThreshold: 30000,
        ratelimiterOffset: 0,
        requestTimeout: 15000,
        maxSignatureTimestamp: 5000,
        endpointPath: '/interactions',
        serverPort: 80,
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
   * @see {@link SlashCreator#registerCommands}
   */
  registerCommand(command: any) {
    if (typeof command === 'function') command = new command(this);
    else if (typeof command.default === 'function') command = new command.default(this);

    if (!(command instanceof SlashCommand)) throw new Error(`Invalid command object to register: ${command}`);

    // Make sure there aren't any conflicts
    if (this.commands.some((cmd) => cmd.keyName === command.keyName))
      throw new Error(`A command with the name "${command.commandName}" is already registered.`);
    this.commands.set(command.keyName, command);

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
    const commands = [];
    for (const group of Object.values(obj)) {
      for (let command of Object.values<any>(group)) {
        if (typeof command.default === 'function') command = command.default;
        commands.push(command);
      }
    }
    if (typeof options === 'string' && !this.commandsPath) this.commandsPath = options;
    else if (typeof options === 'object' && !this.commandsPath) this.commandsPath = options.dirname;
    return this.registerCommands(commands, true);
  }

  /**
   * Attaches a server to the creator.
   * @param server The server to use
   */
  withServer(server: Server) {
    if (this.server) throw new Error('A server was already set in this creator.');
    this.server = server;

    try {
      this.server.createEndpoint(this.options.endpointPath as string, this._onRequest.bind(this));
    } catch {}

    return this;
  }

  /**
   * Starts the server, if one was defined.
   */
  async startServer() {
    if (!this.server) throw new Error('No server was set in this creator.');

    try {
      await this.server.listen(this.options.serverPort, this.options.serverHost);
      this.emit('debug', 'Server started');
    } catch {
      this.emit(
        'warn',
        oneLine`
          Attempted to start a server of whice cannot be started.
          You may be able to remove \`.startServer()\`.`
      );
    }
  }

  /**
   * Sync all commands with Discord. This ensures that commands exist when handling them.
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

      if (this.commands.size && this.commands.find((command) => !command.guildID))
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
        const commandJSON = JSON.stringify(partialCommand);
        // @TODO Should probably use a different method later
        if (commandJSON !== JSON.stringify(command.commandJSON)) {
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
        const commandJSON = JSON.stringify(partialCommand);
        if (commandJSON !== JSON.stringify(command.commandJSON)) {
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

  _getCommand(commandName: string, guildID: string) {
    return this.commands.get(`${guildID}_${commandName}`) || this.commands.get(`global_${commandName}`);
  }

  async _onRequest(treq: TransformedRequest, respond: RespondFunction) {
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

    const verified = await verifyKey(JSON.stringify(treq.body), signature, timestamp, this.options.publicKey);

    if (!verified) {
      this.emit('debug', 'A request failed to be verified');
      this.emit('unverifiedRequest', treq);
      return respond({
        status: 401,
        body: 'Invalid signature'
      });
    }

    const interaction: AllRequestData = treq.body;

    switch (interaction.type) {
      case InteractionType.PING: {
        this.emit('debug', 'Ping recieved');
        this.emit('ping', treq);
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
          if (this.options.unknownCommandResponse)
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
              status: 404
            });
        } else {
          const ctx = new CommandContext(this, interaction, respond);

          // Ensure the user has permission to use the command
          const hasPermission = command.hasPermission(ctx);
          if (!hasPermission || typeof hasPermission === 'string') {
            const data = { response: typeof hasPermission === 'string' ? hasPermission : undefined };
            this.emit('commandBlock', command, ctx, 'permission', data);
            return command.onBlock(ctx, 'permission', data);
          }

          // Throttle the command
          const throttle = command.throttle(ctx.member.id);
          if (command.throttling && throttle && throttle.usages + 1 > command.throttling.usages) {
            const remaining = (throttle.start + command.throttling.duration * 1000 - Date.now()) / 1000;
            const data = { throttle, remaining };
            this.emit('commandBlock', command, ctx, 'throttling', data);
            return command.onBlock(ctx, 'throttling', data);
          }

          // Run the command
          try {
            this.emit(
              'debug',
              `Running command: ${interaction.data.name} (${interaction.data.id}, guild ${interaction.guild_id})`
            );
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
            return command.onError(err, ctx);
          }
        }
      }
      default: {
        // @ts-ignore
        this.emit('debug', `Unknown interaction type recieved: ${interaction.type}`);
        this.emit('unknownInteraction', treq);
        return respond({
          status: 400
        });
      }
    }
  }
}

export default SlashCreator;
