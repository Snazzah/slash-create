import {
  ApplicationCommand,
  ApplicationCommandPermissions,
  BulkUpdateCommand,
  Endpoints,
  GuildApplicationCommandPermissions,
  PartialApplicationCommand
} from './constants';
import SlashCreator from './creator';

/** The API handler for {@link SlashCreator}. */
class SlashCreatorAPI {
  /** The parent creator. */
  private readonly _creator: SlashCreator;

  /** @param creator The instantiating creator. */
  constructor(creator: SlashCreator) {
    this._creator = creator;
  }

  /**
   * Gets the commands from an applicaton.
   * @param guildID The guild ID to get commands from. If undefined, global commands are fetched.
   */
  getCommands(guildID?: string): Promise<ApplicationCommand[]> {
    return this._creator.requestHandler.request(
      'GET',
      guildID
        ? Endpoints.GUILD_COMMANDS(this._creator.options.applicationID, guildID)
        : Endpoints.COMMANDS(this._creator.options.applicationID)
    );
  }

  /**
   * Creates a command.
   * @param command The command to create.
   * @param guildID The guild ID to put the command on. If undefined, the command is global.
   */
  createCommand(command: PartialApplicationCommand, guildID?: string): Promise<ApplicationCommand> {
    return this._creator.requestHandler.request(
      'POST',
      guildID
        ? Endpoints.GUILD_COMMANDS(this._creator.options.applicationID, guildID)
        : Endpoints.COMMANDS(this._creator.options.applicationID),
      true,
      command
    );
  }

  /**
   * Updates a command.
   * @param commandID The command ID to update.
   * @param command The payload to update the command to.
   * @param guildID The guild ID to put the command on. If undefined, the global command is updated.
   */
  updateCommand(commandID: string, command: PartialApplicationCommand, guildID?: string): Promise<ApplicationCommand> {
    return this._creator.requestHandler.request(
      'PATCH',
      guildID
        ? Endpoints.GUILD_COMMAND(this._creator.options.applicationID, guildID, commandID)
        : Endpoints.COMMAND(this._creator.options.applicationID, commandID),
      true,
      command
    );
  }

  /**
   * Updates multiple commands.
   * @param commands The payload to update the commands to.
   * @param guildID The guild ID to put the command on. If undefined, the global command is updated.
   */
  updateCommands(commands: BulkUpdateCommand[], guildID?: string): Promise<ApplicationCommand> {
    return this._creator.requestHandler.request(
      'PUT',
      guildID
        ? Endpoints.GUILD_COMMANDS(this._creator.options.applicationID, guildID)
        : Endpoints.COMMANDS(this._creator.options.applicationID),
      true,
      commands
    );
  }

  /**
   * Deletes a command.
   * @param commandID The command ID to delete.
   * @param guildID The guild ID to delete the command. If undefined, the global command is deleted.
   */
  deleteCommand(commandID: string, guildID?: string): Promise<unknown> {
    return this._creator.requestHandler.request(
      'DELETE',
      guildID
        ? Endpoints.GUILD_COMMAND(this._creator.options.applicationID, guildID, commandID)
        : Endpoints.COMMAND(this._creator.options.applicationID, commandID)
    );
  }

  getGuildCommandPermissions(guildID: string): Promise<GuildApplicationCommandPermissions[]> {
    return this._creator.requestHandler.request(
      'GET',
      Endpoints.GUILD_COMMAND_PERMISSIONS(this._creator.options.applicationID, guildID)
    );
  }

  getCommandPermissions(guildID: string, commandID: string): Promise<GuildApplicationCommandPermissions> {
    return this._creator.requestHandler.request(
      'GET',
      Endpoints.COMMAND_PERMISSIONS(this._creator.options.applicationID, guildID, commandID)
    );
  }

  updateCommandPermissions(
    guildID: string,
    commandID: string,
    permissions: ApplicationCommandPermissions[]
  ): Promise<GuildApplicationCommandPermissions> {
    return this._creator.requestHandler.request(
      'PUT',
      Endpoints.COMMAND_PERMISSIONS(this._creator.options.applicationID, guildID, commandID),
      true,
      { permissions }
    );
  }

  bulkUpdateCommandPermissions(
    guildID: string,
    commands: PartialApplicationCommand[]
  ): Promise<GuildApplicationCommandPermissions> {
    return this._creator.requestHandler.request(
      'PUT',
      Endpoints.GUILD_COMMAND_PERMISSIONS(this._creator.options.applicationID, guildID),
      true,
      commands
    );
  }

  /**
   * Responds to an interaction.
   * @param interactionID The interaction's ID.
   * @param interactionToken The interaction's token.
   * @param body The body to send.
   */
  interactionCallback(interactionID: string, interactionToken: string, body: any): Promise<unknown> {
    return this._creator.requestHandler.request(
      'POST',
      Endpoints.INTERACTION_CALLBACK(interactionID, interactionToken),
      true,
      body
    );
  }
}

export default SlashCreatorAPI;
