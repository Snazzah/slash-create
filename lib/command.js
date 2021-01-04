"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const util_1 = require("./util");
/** Represents a Discord slash command. */
class SlashCommand {
    /**
     * @param creator The instantiating creator.
     * @param opts The options for the command.
     */
    constructor(creator, opts) {
        /** Current throttle objects for the command, mapped by user ID. */
        this._throttles = new Map();
        if (this.constructor.name === 'SlashCommand')
            throw new Error('The base SlashCommand cannot be instantiated.');
        this.creator = creator;
        if (!opts.unknown)
            SlashCommand.validateOptions(opts);
        this.commandName = opts.name;
        this.description = opts.description;
        this.options = opts.options;
        this.guildID = opts.guildID;
        this.requiredPermissions = opts.requiredPermissions;
        this.throttling = opts.throttling;
        this.unknown = opts.unknown || false;
    }
    /**
     * The JSON for using commands in Discord's API.
     * @private
     */
    get commandJSON() {
        return {
            name: this.commandName,
            description: this.description,
            ...(this.options ? { options: this.options } : {})
        };
    }
    /**
     * The internal key name for the command.
     * @private
     */
    get keyName() {
        return `${this.guildID || 'global'}_${this.commandName}`;
    }
    /**
     * Checks whether the context member has permission to use the command.
     * @param ctx The triggering context
     * @return {boolean|string} Whether the member has permission, or an error message to respond with if they don't
     */
    hasPermission(ctx) {
        if (this.requiredPermissions) {
            const missing = ctx.member.permissions.missing(this.requiredPermissions);
            if (missing.length > 0) {
                if (missing.length === 1) {
                    return `The \`${this.commandName}\` command requires you to have the "${constants_1.PermissionNames[missing[0]]}" permission.`;
                }
                return util_1.oneLine `
          The \`${this.commandName}\` command requires you to have the following permissions:
          ${missing.map((perm) => constants_1.PermissionNames[perm]).join(', ')}
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
    onBlock(ctx, reason, data) {
        switch (reason) {
            case 'permission': {
                if (data.response)
                    return ctx.send(data.response, { ephemeral: true });
                return ctx.send(`You do not have permission to use the \`${this.commandName}\` command.`, { ephemeral: true });
            }
            case 'throttling': {
                return ctx.send(`You may not use the \`${this.commandName}\` command again for another ${data.remaining.toFixed(1)} seconds.`, { ephemeral: true });
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
    onError(err, ctx) {
        if (!ctx.expired && !ctx.initiallyResponded)
            return ctx.send('An error occurred while running the command.', { ephemeral: true });
    }
    /**
     * Creates/obtains the throttle object for a user, if necessary.
     * @param userID ID of the user to throttle for
     * @private
     */
    throttle(userID) {
        if (!this.throttling)
            return null;
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
        if (!this.filePath)
            throw new Error('Cannot reload a command without a file path defined!');
        const newCommand = require(this.filePath);
        this.creator.reregisterCommand(newCommand, this);
    }
    /** Unloads the command. */
    unload() {
        if (this.filePath && require.cache[this.filePath])
            delete require.cache[this.filePath];
        this.creator.unregisterCommand(this);
    }
    /**
     * Runs the command.
     * @param ctx The context of the interaction
     */
    async run(ctx) {
        throw new Error(`${this.constructor.name} doesn't have a run() method.`);
    }
    /**
     * Finalizes the return output
     * @param response The response from the command
     * @param ctx The context of the interaction
     * @private
     */
    finalize(response, ctx) {
        if (!response && !ctx.initiallyResponded)
            return ctx.acknowledge();
        if (typeof response === 'string' || (response && response.constructor && response.constructor.name === 'Object'))
            return ctx.send(response);
    }
    /**
     * Validates {@link SlashCommandOptions}.
     * @private
     */
    static validateOptions(opts) {
        if (typeof opts.name !== 'string')
            throw new TypeError('Command name must be a string.');
        if (opts.name !== opts.name.toLowerCase())
            throw new Error('Command name must be lowercase.');
        if (opts.name.length < 3 || opts.name.length > 32)
            throw new RangeError('Command name must be between 3 and 32 characters.');
        if (typeof opts.description !== 'string')
            throw new TypeError('Command description must be a string.');
        if (opts.description.length < 1 || opts.description.length > 100)
            throw new RangeError('Command description must be under 100 characters.');
        if (opts.options) {
            if (!Array.isArray(opts.options))
                throw new TypeError('Command options must be an Array of options.');
            if (opts.options.length > 10)
                throw new RangeError('Command options cannot exceed 10 options.');
            util_1.validateOptions(opts.options);
        }
        if (opts.requiredPermissions) {
            if (!Array.isArray(opts.requiredPermissions))
                throw new TypeError('Command required permissions must be an Array of permission key strings.');
            for (const perm of opts.requiredPermissions)
                if (!constants_1.PermissionNames[perm])
                    throw new RangeError(`Invalid command required permission: ${perm}`);
        }
        if (opts.throttling) {
            if (typeof opts.throttling !== 'object')
                throw new TypeError('Command throttling must be an Object.');
            if (typeof opts.throttling.usages !== 'number' || isNaN(opts.throttling.usages)) {
                throw new TypeError('Command throttling usages must be a number.');
            }
            if (opts.throttling.usages < 1)
                throw new RangeError('Command throttling usages must be at least 1.');
            if (typeof opts.throttling.duration !== 'number' || isNaN(opts.throttling.duration)) {
                throw new TypeError('Command throttling duration must be a number.');
            }
            if (opts.throttling.duration < 1)
                throw new RangeError('Command throttling duration must be at least 1.');
        }
    }
}
exports.default = SlashCommand;
