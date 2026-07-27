import { MockAgent, setGlobalDispatcher } from 'undici';
import { API_VERSION, ApplicationCommand, Endpoints } from '../../src/constants';
import { MOCK_TOKEN } from './constants';

const DISCORD_URL = 'https://discord.com';
const API_BASE_URL = '/api/v' + API_VERSION;

const mockAgent = new MockAgent();
mockAgent.disableNetConnect();
setGlobalDispatcher(mockAgent);
const mockPool = mockAgent.get(DISCORD_URL);

afterEach(() => mockAgent.assertNoPendingInterceptors());

export interface MockRequest {
  body?: unknown;
}

function reply(method: string, path: string, statusCode: number, response?: unknown) {
  const request: MockRequest = {};

  mockPool.intercept({ method, path }).reply(({ body }) => {
    if (body != null) request.body = JSON.parse(String(body));

    return {
      statusCode,
      data: response === undefined ? '' : JSON.stringify(response),
      responseOptions: {
        headers: {
          'Content-Type': 'application/json',
          Date: new Date().toISOString(),
          'X-RateLimit-Limit': '1000',
          'X-RateLimit-Remaining': '999',
          'X-RateLimit-Reset': String((Date.now() + 60 * 1000) / 1000),
          'X-RateLimit-Reset-After': '3600',
          'X-RateLimit-Bucket': 'mock-bucket'
        }
      }
    };
  });

  return request;
}

// #region Global commands
export const globalCommands = (commands: ApplicationCommand[] = [], withLocalizations = true) =>
  reply('GET', API_BASE_URL + Endpoints.COMMANDS('1') + `?with_localizations=${withLocalizations}`, 200, commands);

export const newGlobalCommand = (command: ApplicationCommand) =>
  reply('POST', API_BASE_URL + Endpoints.COMMANDS('1'), 201, command);

export const updateGlobalCommand = (id: string, command: ApplicationCommand) =>
  reply('PATCH', API_BASE_URL + Endpoints.COMMAND('1', id), 200, command);

export const updateGlobalCommands = (commands: ApplicationCommand[]) =>
  reply('PUT', API_BASE_URL + Endpoints.COMMANDS('1'), 200, commands);

export const deleteGlobalCommand = (id: string) => reply('DELETE', API_BASE_URL + Endpoints.COMMAND('1', id), 204);
// #endregion

// #region Guild commands
export const guildCommands = (commands: ApplicationCommand[] = []) =>
  reply('GET', API_BASE_URL + Endpoints.GUILD_COMMANDS('1', '123') + '?with_localizations=true', 200, commands);

export const newGuildCommand = (command: ApplicationCommand) =>
  reply('POST', API_BASE_URL + Endpoints.GUILD_COMMANDS('1', '123'), 201, command);

export const updateGuildCommand = (id: string, command: ApplicationCommand) =>
  reply('PATCH', API_BASE_URL + Endpoints.GUILD_COMMAND('1', '123', id), 200, command);

export const updateGuildCommands = (commands: ApplicationCommand[] = []) =>
  reply('PUT', API_BASE_URL + Endpoints.GUILD_COMMANDS('1', '123'), 200, commands);

export const deleteGuildCommand = (id: string) =>
  reply('DELETE', API_BASE_URL + Endpoints.GUILD_COMMAND('1', '123', id), 204);
// #endregion

// #region Interactions
export const interactionCallback = (id: string) =>
  reply('POST', API_BASE_URL + Endpoints.INTERACTION_CALLBACK(id, MOCK_TOKEN), 204);

export const createFollowUp = (body: any) =>
  reply('POST', API_BASE_URL + Endpoints.FOLLOWUP_MESSAGE('1', MOCK_TOKEN), 200, body);

export const editMessage = (id: string, body: any) =>
  reply('PATCH', API_BASE_URL + Endpoints.MESSAGE('1', MOCK_TOKEN, id), 200, body);

export const deleteMessage = (id: string) =>
  reply('DELETE', API_BASE_URL + Endpoints.MESSAGE('1', MOCK_TOKEN, id), 204);
// #endregion
