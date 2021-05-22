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

import AWSLambdaServer from './servers/lambda';
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
  ApplicationCommandPermissionType,
  ApplicationCommandPermissions,
  PartialApplicationCommandPermissions,
  GuildApplicationCommandPermissions,
  RawRequest,
  AnyRequestData,
  PingRequestData,
  DMInteractionRequestData,
  GuildInteractionRequestData,
  InteractionRequestData,
  CommandMember,
  CommandUser,
  CommandData,
  AnyCommandOption,
  CommandOption,
  CommandSubcommandOption,
  CommandStringOption,
  CommandIntegerOption,
  CommandBooleanOption,
  ImageFormat
} from './constants';

export type { ConvertedOption } from './context';

export { SlashCommandOptions, CommandPermissions } from './command';

export {
  MessageInteraction,
  MessageReference,
  MessageEmbed,
  MessageEmbedOptions,
  EmbedAuthor,
  EmbedAuthorOptions,
  EmbedField,
  EmbedFooter,
  EmbedFooterOptions,
  EmbedImage,
  EmbedImageOptions,
  EmbedProvider,
  EmbedVideo
} from './structures/message';

export {
  API,
  AWSLambdaServer,
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
