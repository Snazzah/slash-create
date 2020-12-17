import * as Constants from './constants';
import * as Util from './util';
import API from './api';
import BitField from './util/bitfield';
import SlashCommand from './command';
import CommandContext from './context';
import SlashCreator from './creator';
import RequestHandler from './util/requestHandler';
import SequentialBucket from './util/sequentialBucket';
import Server from './server';

import DiscordHTTPError from './errors/DiscordHTTPError';
import DiscordRESTError from './errors/DiscordRESTError';

import ExpressServer from './servers/express';
import FastifyServer from './servers/fastify';
import GatewayServer from './servers/gateway';

import Member from './structures/member';
import Message from './structures/message';
import Permissions from './structures/permissions';
import User from './structures/user';
import UserFlags from './structures/userFlags';

const VERSION: string = require('../package').version;
const CommandOptionType = Constants.CommandOptionType;

// Aliases
const Creator = SlashCreator;
const Context = CommandContext;
const Command = SlashCommand;

export {
  API,
  BitField,
  Command,
  CommandContext,
  CommandOptionType,
  Constants,
  Context,
  Creator,
  DiscordHTTPError,
  DiscordRESTError,
  ExpressServer,
  FastifyServer,
  GatewayServer,
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
