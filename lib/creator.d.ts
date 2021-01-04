/// <reference types="node" />
import Collection from '@discordjs/collection';
import HTTPS from 'https';
import { FormattedAllowedMentions, MessageAllowedMentions } from './util';
import { ImageFormat, RawRequest, RequireAllOptions } from './constants';
import SlashCommand from './command';
import TypedEmitter from './util/typedEmitter';
import RequestHandler from './util/requestHandler';
import SlashCreatorAPI from './api';
import Server, { TransformedRequest } from './server';
import CommandContext from './context';
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
declare const SlashCreator_base: new () => TypedEmitter<SlashCreatorEvents>;
/** The main class for using commands and interactions. */
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
    readonly allowedMentions: FormattedAllowedMentions;
    /** The command to run when an unknown command is used. */
    unknownCommand?: SlashCommand;
    /** @param opts The options for the creator */
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
     * Reregisters a command. (does not support changing name, or guild ID)
     * @param command New command
     * @param oldCommand Old command
     */
    reregisterCommand(command: any, oldCommand: SlashCommand): void;
    /**
     * Unregisters a command.
     * @param command Command to unregister
     */
    unregisterCommand(command: SlashCommand): void;
    /**
     * Attaches a server to the creator.
     * @param server The server to use
     */
    withServer(server: Server): this;
    /** Starts the server, if one was defined. */
    startServer(): Promise<void>;
    /**
     * Sync all commands with Discord. This ensures that commands exist when handling them.
     * <warn>This requires you to have your token set in the creator config.</warn>
     */
    syncCommands(opts?: SyncCommandOptions): this;
    /**
     * Sync guild commands.
     * <warn>This requires you to have your token set in the creator config.</warn>
     * @param guildID The guild to sync
     * @param deleteCommands Whether to delete command not found in the creator
     */
    syncCommandsIn(guildID: string, deleteCommands?: boolean): Promise<void>;
    /**
     * Sync global commands.
     * <warn>This requires you to have your token set in the creator config.</warn>
     * @param deleteCommands Whether to delete command not found in the creator
     */
    syncGlobalCommands(deleteCommands?: boolean): Promise<void>;
    private _getCommand;
    private _onRequest;
    private _onInteraction;
    private _runCommand;
    private _createGatewayRespond;
}
export default SlashCreator;
