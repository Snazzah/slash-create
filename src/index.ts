import * as Constants from './constants';
import * as Util from './util';

import API from './api';
import SlashCommand from './command';
import CommandContext from './context';
import SlashCreator from './creator';
import Server from './server';

import BitField from './util/bitfield';
import RequestHandler from './util/requestHandler';
import SequentialBucket from './util/sequentialBucket';

import DiscordHTTPError from './errors/DiscordHTTPError';
import DiscordRESTError from './errors/DiscordRESTError';

import ExpressServer from './servers/express';
import FastifyServer from './servers/fastify';
import GatewayServer from './servers/gateway';
import GCFServer from './servers/gcf';

import Member from './structures/member';
import Message from './structures/message';
import Permissions from './structures/permissions';
import User from './structures/user';
import UserFlags from './structures/userFlags';

const VERSION: string = require('../package').version;

// Aliases
const Creator = SlashCreator;
const Context = CommandContext;
const Command = SlashCommand;

export {
  InteractionType,
  InterationResponseType,
  InteractionResponseFlags,
  CommandOptionType,
  PartialApplicationCommand,
  ApplicationCommand,
  ApplicationCommandOption,
  ApplicationCommandOptionChoice,
  RawRequest,
  AnyRequestData,
  PingRequestData,
  InteractionRequestData,
  CommandMember,
  CommandUser,
  CommandData,
  AnyCommandOption,
  CommandOption,
  CommandSubcommandOption,
  ImageFormat
} from './constants';

export type { ConvertedOption } from './context';

export { SlashCommandOptions } from './command';

export {
  API,
  BitField,
  Command,
  CommandContext,
  Constants,
  Context,
  Creator,
  DiscordHTTPError,
  DiscordRESTError,
  ExpressServer,
  FastifyServer,
  GatewayServer,
  GCFServer,
  Member,
  Message,
  Permissions,
  RequestHandler,
  SequentialBucket,
  Server,
  SlashCommand,
  SlashCreator,
  User,
  UserFlags,
  Util,
  VERSION
};
