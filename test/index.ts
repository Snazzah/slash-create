import * as chai from 'chai';
import 'mocha';
const expect = chai.expect;

import * as slashCreate from '../src';

describe('[index]', () => {
  it('exports check', () => {
    expect(slashCreate.API).to.be.a('function');
    expect(slashCreate.AWSLambdaServer).to.be.a('function');
    expect(slashCreate.AzureFunctionServer).to.be.a('function');
    expect(slashCreate.BitField).to.be.a('function');
    expect(slashCreate.Command).to.be.a('function');
    expect(slashCreate.CommandContext).to.be.a('function');
    expect(slashCreate.ComponentContext).to.be.a('function');
    expect(slashCreate.MessageInteractionContext).to.be.a('function');
    expect(slashCreate.ApplicationCommandType).to.be.a('object');
    expect(slashCreate.ApplicationCommandPermissionType).to.be.a('object');
    expect(slashCreate.CommandOptionType).to.be.a('object');
    expect(slashCreate.ComponentType).to.be.a('object');
    expect(slashCreate.Constants).to.be.a('object');
    expect(slashCreate.Context).to.be.a('function');
    expect(slashCreate.Creator).to.be.a('function');
    expect(slashCreate.DiscordHTTPError).to.be.a('function');
    expect(slashCreate.DiscordRESTError).to.be.a('function');
    expect(slashCreate.ExpressServer).to.be.a('function');
    expect(slashCreate.FastifyServer).to.be.a('function');
    expect(slashCreate.GCFServer).to.be.a('function');
    expect(slashCreate.GatewayServer).to.be.a('function');
    expect(slashCreate.InteractionResponseFlags).to.be.a('object');
    expect(slashCreate.InteractionType).to.be.a('object');
    expect(slashCreate.InteractionResponseType).to.be.a('object');
    expect(slashCreate.ApplicationCommandPermissionType).to.be.a('object');
    expect(slashCreate.Member).to.be.a('function');
    expect(slashCreate.Message).to.be.a('function');
    expect(slashCreate.Permissions).to.be.a('function');
    expect(slashCreate.RequestHandler).to.be.a('function');
    expect(slashCreate.SequentialBucket).to.be.a('function');
    expect(slashCreate.Server).to.be.a('function');
    expect(slashCreate.SlashCommand).to.be.a('function');
    expect(slashCreate.SlashCreator).to.be.a('function');
    expect(slashCreate.User).to.be.a('function');
    expect(slashCreate.UserFlags).to.be.a('function');
    expect(slashCreate.Util).to.be.a('object');
    expect(slashCreate.VERSION).to.be.a('string');
  });
});
