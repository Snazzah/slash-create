import nock from 'nock';
import { API_BASE_URL, ApplicationCommand, Endpoints } from '../../src/constants';
import { MOCK_TOKEN } from './constants';

const DISCORD_URL = 'https://discord.com';

const NOCK_HEADERS = {
  'Content-Type': 'application/json',
  Date: () => new Date().toISOString(),
  'X-RateLimit-Limit': '1000',
  'X-RateLimit-Remaining': '999',
  'X-RateLimit-Reset': () => String((Date.now() + 60 * 1000) / 1000),
  'X-RateLimit-Reset-After': '3600',
  'X-RateLimit-Bucket': 'nock-bucket'
};

// #region Global commands
export const globalCommands = (commands: ApplicationCommand[] = []) =>
  nock(DISCORD_URL)
    .get(API_BASE_URL + Endpoints.COMMANDS('1'))
    .reply(200, commands, NOCK_HEADERS);

export const newGlobalCommand = (command: ApplicationCommand) =>
  nock(DISCORD_URL)
    .post(API_BASE_URL + Endpoints.COMMANDS('1'))
    .reply(201, command, NOCK_HEADERS);

export const updateGlobalCommand = (id: string, command: ApplicationCommand) =>
  nock(DISCORD_URL)
    .patch(API_BASE_URL + Endpoints.COMMAND('1', id))
    .reply(200, command, NOCK_HEADERS);

export const deleteGlobalCommand = (id: string) =>
  nock(DISCORD_URL)
    .delete(API_BASE_URL + Endpoints.COMMAND('1', id))
    .reply(204, undefined, NOCK_HEADERS);
// #endregion

// #region Guild commands
export const guildCommands = (commands: ApplicationCommand[] = []) =>
  nock(DISCORD_URL)
    .get(API_BASE_URL + Endpoints.GUILD_COMMANDS('1', '123'))
    .reply(200, commands, NOCK_HEADERS);

export const newGuildCommand = (command: ApplicationCommand) =>
  nock(DISCORD_URL)
    .post(API_BASE_URL + Endpoints.GUILD_COMMANDS('1', '123'))
    .reply(201, command, NOCK_HEADERS);

export const updateGuildCommand = (id: string, command: ApplicationCommand) =>
  nock(DISCORD_URL)
    .patch(API_BASE_URL + Endpoints.GUILD_COMMAND('1', '123', id))
    .reply(200, command, NOCK_HEADERS);

export const deleteGuildCommand = (id: string) =>
  nock(DISCORD_URL)
    .delete(API_BASE_URL + Endpoints.GUILD_COMMAND('1', '123', id))
    .reply(204, undefined, NOCK_HEADERS);
// #endregion

// #region Interactions
export const interactionCallback = (id: string) =>
  nock(DISCORD_URL)
    .post(API_BASE_URL + Endpoints.INTERACTION_CALLBACK(id, MOCK_TOKEN))
    .reply(204, undefined, NOCK_HEADERS);

export const createFollowUp = (body: any) =>
  nock(DISCORD_URL)
    .post(API_BASE_URL + Endpoints.FOLLOWUP_MESSAGE('1', MOCK_TOKEN))
    .reply(200, body, NOCK_HEADERS);

export const editMessage = (id: string, body: any) =>
  nock(DISCORD_URL)
    .patch(API_BASE_URL + Endpoints.MESSAGE('1', MOCK_TOKEN, id))
    .reply(200, body, NOCK_HEADERS);

export const deleteMessage = (id: string) =>
  nock(DISCORD_URL)
    .delete(API_BASE_URL + Endpoints.MESSAGE('1', MOCK_TOKEN, id))
    .reply(204, undefined, NOCK_HEADERS);
// #endregion
