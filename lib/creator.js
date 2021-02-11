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
const lodash_1 = require("lodash");
/** The main class for using commands and interactions. */
class SlashCreator extends eventemitter3_1.default {
    /** @param opts The options for the creator */
    constructor(opts) {
        // eslint-disable-next-line constructor-super
        super();
        /** The API handler for the creator */
        this.api = new api_1.default(this);
        /** The commands loaded onto the creator */
        this.commands = new collection_1.default();
        if (!opts.applicationID)
            throw new Error('An application ID must be defined!');
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
            unknownCommandResponse: true,
            autoAcknowledgeSource: false,
            latencyThreshold: 30000,
            ratelimiterOffset: 0,
            requestTimeout: 15000,
            maxSignatureTimestamp: 5000,
            endpointPath: '/interactions',
            serverPort: 8030,
            serverHost: 'localhost'
        }, opts);
        this.allowedMentions = util_1.formatAllowedMentions(this.options.allowedMentions);
        this.requestHandler = new requestHandler_1.default(this);
        this.api = new api_1.default(this);
    }
    /**
     * Registers a single command
     * @param command Either a Command instance, or a constructor for one
     * @see SlashCreator#registerCommands
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
            throw new Error(`A command with the name "${command.commandName}" (${command.keyName}) is already registered.`);
        if (command.guildIDs &&
            this.commands.some((cmd) => !!(cmd.guildIDs && cmd.guildIDs.map((gid) => command.guildIDs.includes(gid)).includes(true))))
            throw new Error(`A command with the name "${command.commandName}" has a conflicting guild ID.`);
        if (command.unknown && this.unknownCommand)
            throw new Error('An unknown command is already registered.');
        if (command.unknown)
            this.unknownCommand = command;
        else
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
        function iterate(obj) {
            for (const command of Object.values(obj)) {
                if (typeof command === 'function')
                    commands.push(command);
                else if (typeof command === 'object')
                    iterate(command);
            }
        }
        iterate(obj);
        if (typeof options === 'string' && !this.commandsPath)
            this.commandsPath = options;
        else if (typeof options === 'object' && !this.commandsPath)
            this.commandsPath = options.dirname;
        return this.registerCommands(commands, true);
    }
    /**
     * Reregisters a command. (does not support changing name, or guild ID)
     * @param command New command
     * @param oldCommand Old command
     */
    reregisterCommand(command, oldCommand) {
        if (typeof command === 'function')
            command = new command(this);
        else if (typeof command.default === 'function')
            command = new command.default(this);
        if (!(command instanceof command_1.default))
            throw new Error(`Invalid command object to reregister: ${command}`);
        if (!command.unknown) {
            if (command.commandName !== oldCommand.commandName)
                throw new Error('Command name cannot change.');
            if (lodash_1.isEqual(command.guildIDs, oldCommand.guildIDs))
                throw new Error('Command guild IDs cannot change.');
            this.commands.set(command.keyName, command);
        }
        else if (this.unknownCommand !== oldCommand) {
            throw new Error('An unknown command is already registered.');
        }
        else {
            this.unknownCommand = command;
        }
        this.emit('commandReregister', command, oldCommand);
        this.emit('debug', `Reregistered command ${command.keyName}.`);
    }
    /**
     * Unregisters a command.
     * @param command Command to unregister
     */
    unregisterCommand(command) {
        if (this.unknownCommand === command)
            this.unknownCommand = undefined;
        else
            this.commands.delete(command.keyName);
        this.emit('commandUnregister', command);
        this.emit('debug', `Unregistered command ${command.keyName}.`);
    }
    /**
     * Attaches a server to the creator.
     * @param server The server to use
     */
    withServer(server) {
        if (this.server)
            throw new Error('A server was already set in this creator.');
        this.server = server;
        if (this.server.isWebserver) {
            if (!this.options.publicKey)
                throw new Error('A public key is required to be set when using a webserver.');
            this.server.createEndpoint(this.options.endpointPath, this._onRequest.bind(this));
        }
        else
            this.server.handleInteraction((interaction) => this._onInteraction(interaction, null, false));
        return this;
    }
    /** Starts the server, if one was defined. */
    async startServer() {
        if (!this.server)
            throw new Error('No server was set in this creator.');
        await this.server.listen(this.options.serverPort, this.options.serverHost);
        this.emit('debug', 'Server started');
    }
    /**
     * Sync all commands with Discord. This ensures that commands exist when handling them.
     * <warn>This requires you to have your token set in the creator config.</warn>
     */
    syncCommands(opts) {
        const options = Object.assign({
            deleteCommands: true,
            syncGuilds: true,
            skipGuildErrors: true
        }, opts);
        const promise = async () => {
            let guildIDs = [];
            // Collect guild IDs with specific commands
            for (const [, command] of this.commands) {
                if (command.guildIDs)
                    guildIDs = lodash_1.uniq([...guildIDs, ...command.guildIDs]);
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
     * <warn>This requires you to have your token set in the creator config.</warn>
     * @param guildID The guild to sync
     * @param deleteCommands Whether to delete command not found in the creator
     */
    async syncCommandsIn(guildID, deleteCommands = true) {
        const commands = await this.api.getCommands(guildID);
        const handledCommands = [];
        const updatePayload = [];
        for (const applicationCommand of commands) {
            const partialCommand = Object.assign({}, applicationCommand);
            delete partialCommand.application_id;
            delete partialCommand.guild_id;
            delete partialCommand.id;
            delete partialCommand.version;
            const command = this.commands.find((command) => !!(command.guildIDs && command.guildIDs.includes(guildID) && command.commandName === partialCommand.name));
            if (command) {
                if (!lodash_1.isEqual(util_1.objectKeySort(partialCommand), util_1.objectKeySort(command.commandJSON))) {
                    this.emit('debug', `Updating guild command "${applicationCommand.name}" (${applicationCommand.id}, guild: ${guildID})`);
                    updatePayload.push({
                        id: applicationCommand.id,
                        ...command.commandJSON
                    });
                }
                else {
                    this.emit('debug', `Guild command "${applicationCommand.name}" (${applicationCommand.id}) synced (guild: ${guildID})`);
                }
                handledCommands.push(command.keyName);
            }
            else if (deleteCommands) {
                // Command is removed
                this.emit('debug', `Removing guild command "${applicationCommand.name}" (${applicationCommand.id}, guild: ${guildID})`);
                await this.api.deleteCommand(applicationCommand.id, guildID);
            }
        }
        if (updatePayload.length)
            await this.api.updateCommands(updatePayload, guildID);
        const unhandledCommands = this.commands.filter((command) => !!(command.guildIDs && command.guildIDs.includes(guildID) && !handledCommands.includes(command.keyName)));
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
        const handledCommands = [];
        const updatePayload = [];
        for (const applicationCommand of commands) {
            const partialCommand = Object.assign({}, applicationCommand);
            const commandKey = `global:${partialCommand.name}`;
            delete partialCommand.application_id;
            delete partialCommand.id;
            delete partialCommand.version;
            const command = this.commands.get(commandKey);
            if (command) {
                if (!lodash_1.isEqual(util_1.objectKeySort(partialCommand), util_1.objectKeySort(command.commandJSON))) {
                    this.emit('debug', `Updating command "${applicationCommand.name}" (${applicationCommand.id})`);
                    updatePayload.push({
                        id: applicationCommand.id,
                        ...command.commandJSON
                    });
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
        if (updatePayload.length)
            this.api.updateCommands(updatePayload);
        const unhandledCommands = this.commands.filter((command) => !command.guildIDs && !handledCommands.includes(command.keyName));
        for (const [, command] of unhandledCommands) {
            this.emit('debug', `Creating command "${command.commandName}"`);
            await this.api.createCommand(command.commandJSON);
        }
    }
    _getCommandFromInteraction(interaction) {
        return 'guild_id' in interaction
            ? this.commands.find((command) => !!(command.guildIDs &&
                command.guildIDs.includes(interaction.guild_id) &&
                command.commandName === interaction.data.name)) || this.commands.get(`global:${interaction.data.name}`)
            : this.commands.get(`global:${interaction.data.name}`);
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
        return this._onInteraction(treq.body, respond, true);
    }
    async _onInteraction(interaction, respond, webserverMode) {
        this.emit('debug', 'Got interaction');
        if (!respond || !webserverMode)
            respond = this._createGatewayRespond(interaction.id, interaction.token);
        switch (interaction.type) {
            case constants_1.InteractionType.PING: {
                this.emit('debug', 'Ping recieved');
                this.emit('ping', interaction.user);
                return respond({
                    status: 200,
                    body: {
                        type: constants_1.InterationResponseType.PONG
                    }
                });
            }
            case constants_1.InteractionType.COMMAND: {
                const command = this._getCommandFromInteraction(interaction);
                if (!command) {
                    this.emit('debug', `Unknown command: ${interaction.data.name} (${interaction.data.id}, ${'guild_id' in interaction ? `guild ${interaction.guild_id}` : `user ${interaction.user.id}`})`);
                    if (this.unknownCommand) {
                        const ctx = new context_1.default(this, interaction, respond, webserverMode);
                        return this._runCommand(this.unknownCommand, ctx);
                    }
                    else if (this.options.unknownCommandResponse)
                        return respond({
                            status: 200,
                            body: {
                                type: constants_1.InterationResponseType.CHANNEL_MESSAGE,
                                data: {
                                    content: util_1.oneLine `
                    This command no longer exists.
                    This command should no longer show up in an hour if it has been deleted.
                  `,
                                    flags: constants_1.InteractionResponseFlags.EPHEMERAL
                                }
                            }
                        });
                    else
                        return respond({
                            status: 200,
                            body: {
                                type: constants_1.InterationResponseType.ACKNOWLEDGE
                            }
                        });
                }
                else {
                    const ctx = new context_1.default(this, interaction, respond, webserverMode);
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
                    if (throttle)
                        throttle.usages++;
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
    async _runCommand(command, ctx) {
        try {
            this.emit('debug', `Running command: ${ctx.data.data.name} (${ctx.data.data.id}, ${'guild_id' in ctx.data ? `guild ${ctx.data.guild_id}` : `user ${ctx.data.user.id}`})`);
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
            try {
                return command.onError(err, ctx);
            }
            catch (secondErr) {
                return this.emit('error', secondErr);
            }
        }
    }
    _createGatewayRespond(interactionID, token) {
        return async (response) => {
            await this.api.interactionCallback(interactionID, token, response.body);
        };
    }
}
exports.default = SlashCreator;
