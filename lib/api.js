"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
/** The API handler for {@link SlashCreator}. */
class SlashCreatorAPI {
    /** @param creator The instantiating creator. */
    constructor(creator) {
        this._creator = creator;
    }
    /**
     * Gets the commands from an applicaton.
     * @param guildID The guild ID to get commands from. If undefined, global commands are fetched.
     */
    getCommands(guildID) {
        return this._creator.requestHandler.request('GET', guildID
            ? constants_1.Endpoints.GUILD_COMMANDS(this._creator.options.applicationID, guildID)
            : constants_1.Endpoints.COMMANDS(this._creator.options.applicationID));
    }
    /**
     * Creates a command.
     * @param command The command to create.
     * @param guildID The guild ID to put the command on. If undefined, the command is global.
     */
    createCommand(command, guildID) {
        return this._creator.requestHandler.request('POST', guildID
            ? constants_1.Endpoints.GUILD_COMMANDS(this._creator.options.applicationID, guildID)
            : constants_1.Endpoints.COMMANDS(this._creator.options.applicationID), true, command);
    }
    /**
     * Updates a command.
     * @param commandID The command ID to update.
     * @param command The payload to update the command to.
     * @param guildID The guild ID to put the command on. If undefined, the global command is updated.
     */
    updateCommand(commandID, command, guildID) {
        return this._creator.requestHandler.request('PATCH', guildID
            ? constants_1.Endpoints.GUILD_COMMAND(this._creator.options.applicationID, guildID, commandID)
            : constants_1.Endpoints.COMMAND(this._creator.options.applicationID, commandID), true, command);
    }
    /**
     * Updates multiple commands.
     * @param commands The payload to update the commands to.
     * @param guildID The guild ID to put the command on. If undefined, the global command is updated.
     */
    updateCommands(commands, guildID) {
        return this._creator.requestHandler.request('PUT', guildID
            ? constants_1.Endpoints.GUILD_COMMANDS(this._creator.options.applicationID, guildID)
            : constants_1.Endpoints.COMMANDS(this._creator.options.applicationID), true, commands);
    }
    /**
     * Deletes a command.
     * @param commandID The command ID to delete.
     * @param guildID The guild ID to delete the command. If undefined, the global command is deleted.
     */
    deleteCommand(commandID, guildID) {
        return this._creator.requestHandler.request('DELETE', guildID
            ? constants_1.Endpoints.GUILD_COMMAND(this._creator.options.applicationID, guildID, commandID)
            : constants_1.Endpoints.COMMAND(this._creator.options.applicationID, commandID));
    }
    /**
     * Responds to an interaction.
     * @param interactionID The interaction's ID.
     * @param interactionToken The interaction's token.
     * @param body The body to send.
     */
    interactionCallback(interactionID, interactionToken, body) {
        return this._creator.requestHandler.request('POST', constants_1.Endpoints.INTERACTION_CALLBACK(interactionID, interactionToken), true, body);
    }
}
exports.default = SlashCreatorAPI;
