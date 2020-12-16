/// <reference types="node" />
import TypedEmitter from 'typed-emitter';
import Collection from '@discordjs/collection';
import HTTPS from 'https';
import { FormattedAllowedMentions, MessageAllowedMentions } from './util';
import { ImageFormat, RawRequest, RequireAllOptions } from './constants';
import SlashCommand from './command';
import RequestHandler from './util/requestHandler';
import SlashCreatorAPI from './api';
import Server, { TransformedRequest } from './server';
import CommandContext from './context';
interface SlashCreatorEvents {
    /**
     * Emitted when Discord pings the interaction endpoint.
     * @event SlashCreator#ping
     */
    ping: () => void;
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
     * @param interaction The unhandled interaction
     */
    unknownInteraction: (interaction: any) => void;
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
declare const SlashCreator_base: new () => TypedEmitter<SlashCreatorEvents>;
declare class SlashCreator extends SlashCreator_base {
    options: SlashCreatorOptions;
    readonly requestHandler: RequestHandler;
    readonly api: SlashCreatorAPI;
    readonly commands: Collection<string, SlashCommand>;
    commandsPath?: string;
    server?: Server;
    allowedMentions: FormattedAllowedMentions;
    constructor(opts: SlashCreatorOptions);
    /**
     * Registers a single command
     * @param command Either a Command instance, or a constructor for one
     * @see SlashCreator#registerCommands
     */
    registerCommand(command: any): this;
    /**
     * Registers multiple commands
     * @param commands An array of Command instances or constructors
     * @param ignoreInvalid Whether to skip over invalid objects without throwing an error
     */
    registerCommands(commands: any[], ignoreInvalid?: boolean): this;
    /**
     * Registers all commands in a directory. The files must export a Command class constructor or instance.
     * @param options The path to the directory, or a require-all options object
     * @example
     * const path = require('path');
     * creator.registerCommandsIn(path.join(__dirname, 'commands'));
     */
    registerCommandsIn(options: RequireAllOptions | string): this;
    /**
     * Attaches a server to the creator.
     * @param server The server to use
     */
    withServer(server: Server): this;
    /**
     * Starts the server, if one was defined.
     */
    startServer(): Promise<void>;
    /**
     * Sync all commands with Discord. This ensures that commands exist when handling them.
     */
    syncCommands(opts?: SyncCommandOptions): this;
    /**
     * Sync guild commands.
     * @param guildID The guild to sync
     * @param deleteCommands Whether to delete command not found in the creator
     */
    syncCommandsIn(guildID: string, deleteCommands?: boolean): Promise<void>;
    /**
     * Sync global commands.
     * @param deleteCommands Whether to delete command not found in the creator
     */
    syncGlobalCommands(deleteCommands?: boolean): Promise<void>;
    private _getCommand;
    private _onRequest;
    private _onInteraction;
    private _createGatewayRespond;
}
export default SlashCreator;
