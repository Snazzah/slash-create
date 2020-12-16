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
    ping: () => void;
    synced: () => void;
    rawREST: (request: RawRequest) => void;
    warn: (warning: Error | string) => void;
    debug: (message: string) => void;
    error: (err: Error) => void;
    unverifiedRequest: (treq: TransformedRequest) => void;
    unknownInteraction: (interaction: any) => void;
    commandRegister: (command: SlashCommand, creator: SlashCreator) => void;
    commandBlock: (command: SlashCommand, ctx: CommandContext, reason: string, data: any) => void;
    commandError: (command: SlashCommand, err: Error, ctx: CommandContext) => void;
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
    /** The options from constructing the creator */
    options: SlashCreatorOptions;
    /** The request handler for the creator */
    readonly requestHandler: RequestHandler;
    /** The API handler for the creator */
    readonly api: SlashCreatorAPI;
    /** The commands loaded onto the creator */
    readonly commands: Collection<string, SlashCommand>;
    /**
     * The path where the commands were loaded from
     * @see #registerCommandsIn
     */
    commandsPath?: string;
    /** The server being used in the creator */
    server?: Server;
    /** The formatted allowed mentions from the options */
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
