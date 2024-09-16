import {
  ApplicationCommand,
  BulkUpdateCommand,
  Endpoints,
  InteractionCallbackResponse,
  PartialApplicationCommand
} from './constants';
import { BaseSlashCreator } from './creator';
import type { FileContent } from './rest/requestHandler';
import type { MessageData } from './structures/message';

/** The API handler for {@link SlashCreator}. */
export class SlashCreatorAPI {
  /** The parent creator. */
  private readonly _creator: BaseSlashCreator;

  /** @param creator The instantiating creator. */
  constructor(creator: BaseSlashCreator) {
    this._creator = creator;
  }

  /**
   * Gets the commands from an applicaton.
   * @param guildID The guild ID to get commands from. If undefined, global commands are fetched.
   * @param withLocalizations Whether to include localizations within the commands.
   */
  getCommands(guildID?: string, withLocalizations = false): Promise<ApplicationCommand[]> {
    return this._creator.requestHandler.request(
      'GET',
      guildID
        ? Endpoints.GUILD_COMMANDS(this._creator.options.applicationID, guildID)
        : Endpoints.COMMANDS(this._creator.options.applicationID),
      { auth: true, query: { with_localizations: withLocalizations } }
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
      { auth: true, body: command }
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
      { auth: true, body: command }
    );
  }

  /**
   * Updates multiple commands.
   * @param commands The payload to update the commands to.
   * @param guildID The guild ID to put the command on. If undefined, the global command is updated.
   */
  updateCommands(commands: BulkUpdateCommand[], guildID?: string): Promise<ApplicationCommand[]> {
    return this._creator.requestHandler.request(
      'PUT',
      guildID
        ? Endpoints.GUILD_COMMANDS(this._creator.options.applicationID, guildID)
        : Endpoints.COMMANDS(this._creator.options.applicationID),
      { auth: true, body: commands }
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
        : Endpoints.COMMAND(this._creator.options.applicationID, commandID),
      { auth: true }
    );
  }

  /**
   * Creates a follow up message.
   * @param interactionID The interaction's ID.
   * @param interactionToken The interaction's token.
   * @param body The body to send.
   * @param files The files to send.
   */
  followUpMessage(
    interactionID: string,
    interactionToken: string,
    body: any,
    files?: FileContent[]
  ): Promise<MessageData> {
    return this._creator.requestHandler.request('POST', Endpoints.FOLLOWUP_MESSAGE(interactionID, interactionToken), {
      auth: true,
      body,
      files
    });
  }

  /**
   * Fetches a message from an interaction.
   * @param interactionID The interaction's ID.
   * @param interactionToken The interaction's token.
   * @param messageID The message ID to fetch.
   */
  fetchInteractionMessage(interactionID: string, interactionToken: string, messageID: string): Promise<MessageData> {
    return this._creator.requestHandler.request('GET', Endpoints.MESSAGE(interactionID, interactionToken, messageID), {
      auth: true
    });
  }

  /**
   * Updates a message from an interaction.
   * @param interactionID The interaction's ID.
   * @param interactionToken The interaction's token.
   * @param messageID The message ID to update.
   * @param body The body to send.
   * @param files The files to send.
   */
  updateInteractionMessage(
    interactionID: string,
    interactionToken: string,
    messageID: string,
    body: any,
    files?: FileContent[]
  ): Promise<MessageData> {
    return this._creator.requestHandler.request(
      'PATCH',
      Endpoints.MESSAGE(interactionID, interactionToken, messageID),
      {
        auth: true,
        body,
        files
      }
    );
  }

  /**
   * Deletes a message from an interaction.
   * @param interactionID The interaction's ID.
   * @param interactionToken The interaction's token.
   * @param messageID The message ID to delete.
   */
  deleteInteractionMessage(interactionID: string, interactionToken: string, messageID = '@original'): Promise<void> {
    return this._creator.requestHandler.request(
      'DELETE',
      Endpoints.MESSAGE(interactionID, interactionToken, messageID),
      {
        auth: true
      }
    );
  }

  /**
   * Responds to an interaction.
   * @param interactionID The interaction's ID.
   * @param interactionToken The interaction's token.
   * @param body The body to send.
   * @param files The files to send.
   * @param withResponse Whether to recieve the response of the interaction callback
   */
  interactionCallback<WithResponse extends boolean = false>(
    interactionID: string,
    interactionToken: string,
    body: any,
    files?: FileContent[],
    withResponse?: WithResponse
  ): Promise<WithResponse extends true ? InteractionCallbackResponse : null>;
  interactionCallback(
    interactionID: string,
    interactionToken: string,
    body: any,
    files?: FileContent[],
    withResponse = false
  ): Promise<InteractionCallbackResponse | null> {
    return this._creator.requestHandler.request(
      'POST',
      Endpoints.INTERACTION_CALLBACK(interactionID, interactionToken),
      {
        auth: false,
        body,
        files,
        query: { with_response: withResponse }
      }
    );
  }
}

export const API = SlashCreatorAPI;
