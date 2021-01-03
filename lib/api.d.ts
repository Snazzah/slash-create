import { ApplicationCommand, PartialApplicationCommand } from './constants';
import SlashCreator from './creator';
/** The API handler for {@link SlashCreator}. */
declare class SlashCreatorAPI {
    /** The parent creator. */
    private readonly _creator;
    /** @param creator The instantiating creator. */
    constructor(creator: SlashCreator);
    /**
     * Gets the commands from an applicaton.
     * @param guildID The guild ID to get commands from. If undefined, global commands are fetched.
     */
    getCommands(guildID?: string): Promise<ApplicationCommand[]>;
    /**
     * Creates a command.
     * @param command The command to create.
     * @param guildID The guild ID to put the command on. If undefined, the command is global.
     */
    createCommand(command: PartialApplicationCommand, guildID?: string): Promise<ApplicationCommand>;
    /**
     * Updates a command.
     * @param commandID The command ID to update.
     * @param command The payload to update the command to.
     * @param guildID The guild ID to put the command on. If undefined, the global command is updated.
     */
    updateCommand(commandID: string, command: PartialApplicationCommand, guildID?: string): Promise<ApplicationCommand>;
    /**
     * Deletes a command.
     * @param commandID The command ID to delete.
     * @param guildID The guild ID to delete the command. If undefined, the global command is deleted.
     */
    deleteCommand(commandID: string, guildID?: string): Promise<unknown>;
    /**
     * Responds to an interaction.
     * @param interactionID The interaction's ID.
     * @param interactionToken The interaction's token.
     * @param body The body to send.
     */
    interactionCallback(interactionID: string, interactionToken: string, body: any): Promise<unknown>;
}
export default SlashCreatorAPI;
