"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = __importDefault(require("eventemitter3"));
const collection_1 = __importDefault(require("@discordjs/collection"));
const util_1 = require("./util");
const constants_1 = require("./constants");
const command_1 = __importDefault(require("./command"));
const requestHandler_1 = __importDefault(require("./util/requestHandler"));
const api_1 = __importDefault(require("./api"));
const context_1 = __importDefault(require("./context"));
class SlashCreator extends eventemitter3_1.default {
    constructor(opts) {
        // eslint-disable-next-line constructor-super
        super();
        this.commands = new collection_1.default();
        if (!opts.applicationID)
            throw new Error('An application ID must be defined!');
        if (!opts.publicKey)
            throw new Error('A public key must be defined!');
        if (opts.token && !opts.token.startsWith('Bot ') && !opts.token.startsWith('Bearer '))
            opts.token = 'Bot ' + opts.token;
        // Define default options
        this.options = Object.assign({
            agent: null,
            allowedMentions: {
                users: true,
                roles: true
            },
            defaultImageFormat: 'jpg',
            defaultImageSize: 128,
            latencyThreshold: 30000,
            ratelimiterOffset: 0,
            requestTimeout: 15000,
            maxSignatureTimestamp: 5000,
            endpointPath: '/interactions',
            serverPort: 80,
            serverHost: 'localhost'
        }, opts);
        this.allowedMentions = util_1.formatAllowedMentions(this.options.allowedMentions);
        this.requestHandler = new requestHandler_1.default(this);
        this.api = new api_1.default(this);
    }
    /**
     * Registers a single command
     * @param command Either a Command instance, or a constructor for one
     * @see {@link SlashCreator#registerCommands}
     */
    registerCommand(command) {
        if (typeof command === 'function')
            command = new command(this);
        else if (typeof command.default === 'function')
            command = new command.default(this);
        if (!(command instanceof command_1.default))
            throw new Error(`Invalid command object to register: ${command}`);
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
    registerCommands(commands, ignoreInvalid = false) {
        if (!Array.isArray(commands))
            throw new TypeError('Commands must be an Array.');
        for (const command of commands) {
            const valid = typeof command === 'function' ||
                typeof command.default === 'function' ||
                command instanceof command_1.default ||
                command.default instanceof command_1.default;
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
    registerCommandsIn(options) {
        const obj = require('require-all')(options);
        const commands = [];
        for (const group of Object.values(obj)) {
            for (let command of Object.values(group)) {
                if (typeof command.default === 'function')
                    command = command.default;
                commands.push(command);
            }
        }
        if (typeof options === 'string' && !this.commandsPath)
            this.commandsPath = options;
        else if (typeof options === 'object' && !this.commandsPath)
            this.commandsPath = options.dirname;
        return this.registerCommands(commands, true);
    }
    /**
     * Attaches a server to the creator.
     * @param server The server to use
     */
    withServer(server) {
        if (this.server)
            throw new Error('A server was already set in this creator.');
        this.server = server;
        try {
            this.server.createEndpoint(this.options.endpointPath, this._onRequest.bind(this));
        }
        catch { }
        return this;
    }
    /**
     * Starts the server, if one was defined.
     */
    async startServer() {
        if (!this.server)
            throw new Error('No server was set in this creator.');
        try {
            await this.server.listen(this.options.serverPort, this.options.serverHost);
            this.emit('debug', 'Server started');
        }
        catch {
            this.emit('warn', util_1.oneLine `
          Attempted to start a server of whice cannot be started.
          You may be able to remove \`.startServer()\`.`);
        }
    }
    /**
     * Sync all commands with Discord. This ensures that commands exist when handling them.
     */
    syncCommands(opts) {
        const options = Object.assign({
            deleteCommands: true,
            syncGuilds: true,
            skipGuildErrors: true
        }, opts);
        const promise = async () => {
            const guildIDs = [];
            // Collect guild IDs with specific commands
            for (const [, command] of this.commands) {
                if (command.guildID && !guildIDs.includes(command.guildID))
                    guildIDs.push(command.guildID);
            }
            await this.syncGlobalCommands(options.deleteCommands);
            // Sync guild commands
            for (const guildID of guildIDs) {
                try {
                    await this.syncCommandsIn(guildID, options.deleteCommands);
                }
                catch (e) {
                    if (options.skipGuildErrors) {
                        this.emit('warn', `An error occurred during guild sync (${guildID}), you may no longer have access to that guild.`);
                    }
                    else {
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
    async syncCommandsIn(guildID, deleteCommands = true) {
        const commands = await this.api.getCommands(guildID);
        const handledCommands = [];
        for (const applicationCommand of commands) {
            const partialCommand = applicationCommand;
            const commandKey = `${guildID}_${partialCommand.name}`;
            delete partialCommand.application_id;
            delete partialCommand.id;
            const command = this.commands.get(commandKey);
            if (command) {
                const commandJSON = JSON.stringify(partialCommand);
                // @TODO Should probably use a different method later
                if (commandJSON !== JSON.stringify(command.commandJSON)) {
                    this.emit('debug', `Updating guild command "${applicationCommand.name}" (${applicationCommand.id}, guild: ${guildID})`);
                    await this.api.updateCommand(applicationCommand.id, command.commandJSON, guildID);
                }
                else {
                    this.emit('debug', `Guild command "${applicationCommand.name}" (${applicationCommand.id}) synced (guild: ${guildID})`);
                }
            }
            else if (deleteCommands) {
                // Command is removed
                this.emit('debug', `Removing guild command "${applicationCommand.name}" (${applicationCommand.id}, guild: ${guildID})`);
                await this.api.deleteCommand(applicationCommand.id, guildID);
            }
            handledCommands.push(commandKey);
        }
        const unhandledCommands = this.commands.filter((command) => command.guildID === guildID && !handledCommands.includes(command.keyName));
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
        const handledCommands = [];
        for (const applicationCommand of commands) {
            const partialCommand = Object.assign({}, applicationCommand);
            const commandKey = `global_${partialCommand.name}`;
            delete partialCommand.application_id;
            delete partialCommand.id;
            const command = this.commands.get(commandKey);
            if (command) {
                const commandJSON = JSON.stringify(partialCommand);
                if (commandJSON !== JSON.stringify(command.commandJSON)) {
                    this.emit('debug', `Updating command "${applicationCommand.name}" (${applicationCommand.id})`);
                    await this.api.updateCommand(applicationCommand.id, command.commandJSON);
                }
                else {
                    this.emit('debug', `Command "${applicationCommand.name}" (${applicationCommand.id}) synced`);
                }
            }
            else if (deleteCommands) {
                this.emit('debug', `Removing command "${applicationCommand.name}" (${applicationCommand.id})`);
                await this.api.deleteCommand(applicationCommand.id);
            }
            handledCommands.push(commandKey);
        }
        const unhandledCommands = this.commands.filter((command) => !command.guildID && !handledCommands.includes(command.keyName));
        for (const [, command] of unhandledCommands) {
            this.emit('debug', `Creating command "${command.commandName}"`);
            await this.api.createCommand(command.commandJSON);
        }
    }
    _getCommand(commandName, guildID) {
        return this.commands.get(`${guildID}_${commandName}`) || this.commands.get(`global_${commandName}`);
    }
    async _onRequest(treq, respond) {
        this.emit('debug', 'Got request');
        // Verify request
        const signature = treq.headers['x-signature-ed25519'];
        const timestamp = treq.headers['x-signature-timestamp'];
        // Check if both signature and timestamp exists, and the timestamp isn't past due.
        if (!signature ||
            !timestamp ||
            parseInt(timestamp) < (Date.now() - this.options.maxSignatureTimestamp) / 1000)
            return respond({
                status: 401,
                body: 'Invalid signature'
            });
        const verified = await util_1.verifyKey(JSON.stringify(treq.body), signature, timestamp, this.options.publicKey);
        if (!verified) {
            this.emit('debug', 'A request failed to be verified');
            this.emit('unverifiedRequest', treq);
            return respond({
                status: 401,
                body: 'Invalid signature'
            });
        }
        const interaction = treq.body;
        switch (interaction.type) {
            case constants_1.InteractionType.PING: {
                this.emit('debug', 'Ping recieved');
                this.emit('ping', treq);
                return respond({
                    status: 200,
                    body: {
                        type: constants_1.InterationResponseType.PONG
                    }
                });
            }
            case constants_1.InteractionType.COMMAND: {
                const command = this._getCommand(interaction.data.name, interaction.guild_id);
                if (!command) {
                    this.emit('debug', `Unknown command: ${interaction.data.name} (${interaction.data.id}, guild ${interaction.guild_id})`);
                    return respond({
                        status: 404
                    });
                }
                else {
                    const ctx = new context_1.default(this, interaction, respond);
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
                        this.emit('debug', `Running command: ${interaction.data.name} (${interaction.data.id}, guild ${interaction.guild_id})`);
                        const promise = command.run(ctx);
                        this.emit('commandRun', command, promise, ctx);
                        const retVal = await promise;
                        if (!(retVal === undefined ||
                            retVal === null ||
                            typeof retVal === 'string' ||
                            (retVal && retVal.constructor && retVal.constructor.name === 'Object'))) {
                            throw new TypeError(util_1.oneLine `
                Command ${command.commandName}'s run() resolved with an unknown type
                (${retVal !== null ? (retVal && retVal.constructor ? retVal.constructor.name : typeof retVal) : null}).
                Command run methods must return a Promise that resolve with a string, Message options, or null/undefined.
              `);
                        }
                        return command.finalize(retVal, ctx);
                    }
                    catch (err) {
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
exports.default = SlashCreator;
