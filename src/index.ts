import * as Constants from './constants';
import * as Util from './util';

import API from './api';
import SlashCommand from './command';
import SlashCreator from './creator';
import Server from './server';

import BitField from './util/bitfield';
import RequestHandler from './util/requestHandler';
import SequentialBucket from './util/sequentialBucket';

import DiscordHTTPError from './errors/DiscordHTTPError';
import DiscordRESTError from './errors/DiscordRESTError';

import AWSLambdaServer from './servers/lambda';
import AzureFunctionServer from './servers/azure';
import ExpressServer from './servers/express';
import FastifyServer from './servers/fastify';
import GatewayServer from './servers/gateway';
import GCFServer from './servers/gcf';

import Member from './structures/member';
import Message from './structures/message';
import Permissions from './structures/permissions';
import User from './structures/user';
import UserFlags from './structures/userFlags';

import ComponentContext from './structures/interfaces/componentContext';
import CommandContext from './structures/interfaces/commandContext';
import MessageInteractionContext from './structures/interfaces/messageInteraction';

const VERSION: string = require('../package').version;

// Aliases
const Creator = SlashCreator;
const Context = CommandContext;
const Command = SlashCommand;

export {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  CommandOptionType,
  PartialApplicationCommand,
  ApplicationCommand,
  ApplicationCommandType,
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
  CommandStringOption,
  CommandIntegerOption,
  CommandBooleanOption,
  CommandSubcommandOption,
  ComponentType,
  ButtonStyle,
  AnyComponent,
  ComponentActionRow,
  AnyComponentButton,
  ComponentButton,
  ComponentButtonLink,
  ComponentSelectMenu,
  ComponentSelectOption,
  PartialEmoji,
  PartialMessage,
  ImageFormat
} from './constants';

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

export type {
  MessageOptions,
  EditMessageOptions,
  FollowUpMessageOptions,
  MessageFile
} from './structures/interfaces/messageInteraction';

export {
  API,
  AWSLambdaServer,
  AzureFunctionServer,
  BitField,
  Command,
  CommandContext,
  ComponentContext,
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
  MessageInteractionContext,
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
