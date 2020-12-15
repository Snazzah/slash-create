import { ApplicationCommand, PartialApplicationCommand } from './constants';
import SlashCreator from './creator';
declare class SlashCreatorAPI {
    private _creator;
    constructor(creator: SlashCreator);
    /**
     * Gets the commands from an applicaton
     * @param guildID The guild ID to get commands from. If undefined, global commands are fetched.
     */
    getCommands(guildID?: string): Promise<ApplicationCommand[]>;
    /**
     * Creates a command
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
     * Delets a command,
     * @param commandID The command ID to delete.
     * @param guildID The guild ID to delete the command. If undefined, the global command is deleted.
     */
    deleteCommand(commandID: string, guildID?: string): Promise<unknown>;
}
export default SlashCreatorAPI;
