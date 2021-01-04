import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
chai.use(chaiAsPromised);
chai.use(chaiNock);
import 'mocha';
const expect = chai.expect;

import SlashCreator from '../src/creator';
import FastifyServer from '../src/servers/fastify';
import GatewayServer from '../src/servers/gateway';
import GCFServer from '../src/servers/gcf';
import { createBasicCommand } from './util/commands';
import { basicCommands } from './util/constants';
import {
  deleteGlobalCommand,
  deleteGuildCommand,
  globalCommands,
  guildCommands,
  newGlobalCommand,
  newGuildCommand,
  updateGlobalCommand,
  updateGuildCommand
} from './util/nock';

describe('SlashCreator', () => {
  describe('constructor', () => {
    const fastifyServer = new FastifyServer();

    it('should error if a webserver is given without a public key', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      expect(creator.withServer.bind(creator, fastifyServer)).to.throw();
    });

    it('should not fail upon adding a server', () => {
      const creator = new SlashCreator({
        applicationID: '1',
        publicKey: 'abc'
      });

      expect(creator.withServer.bind(creator, fastifyServer)).to.not.throw();
    });

    it('should apply properties properly', () => {
      const creator = new SlashCreator({
        applicationID: '1',
        publicKey: 'abc'
      });

      expect(creator.options).to.deep.equal({
        applicationID: '1',
        publicKey: 'abc',
        agent: null,
        allowedMentions: {
          users: true,
          roles: true
        },
        defaultImageFormat: 'jpg',
        defaultImageSize: 128,
        unknownCommandResponse: true,
        autoAcknowledgeSource: false,
        latencyThreshold: 30000,
        ratelimiterOffset: 0,
        requestTimeout: 15000,
        maxSignatureTimestamp: 5000,
        endpointPath: '/interactions',
        serverPort: 8030,
        serverHost: 'localhost'
      });

      expect(creator.allowedMentions).to.deep.equal({
        parse: ['roles', 'users']
      });
    });
  });

  describe('.registerCommand()', () => {
    it('registers command', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand();
      expect(creator.registerCommand.bind(creator, commandClass)).to.not.throw();
      expect(creator.commands.size).to.equal(1);
      expect(creator.commands.first()).to.be.an.instanceof(commandClass);
    });

    it('registers unknown command', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand({ unknown: true });
      expect(creator.registerCommand.bind(creator, commandClass)).to.not.throw();
      expect(creator.commands.size).to.equal(0);
      expect(creator.unknownCommand).to.be.an.instanceof(commandClass);
    });

    it('throws on non-command objects', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      expect(creator.registerCommand.bind(creator, 1)).to.throw();
      expect(creator.registerCommand.bind(creator, true)).to.throw();
      expect(creator.registerCommand.bind(creator, {})).to.throw();
    });

    it('throws on commands already registered', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand();
      expect(creator.registerCommand.bind(creator, commandClass)).to.not.throw();
      expect(creator.registerCommand.bind(creator, commandClass)).to.throw();
    });

    it('throws on unknown commands already registered', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand({ unknown: true });
      expect(creator.registerCommand.bind(creator, commandClass)).to.not.throw();
      expect(creator.registerCommand.bind(creator, commandClass)).to.throw();
    });
  });

  describe('.registerCommand()', () => {
    it('registers commands, filtering out non-command objects', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand();
      expect(creator.registerCommands.bind(creator, [commandClass, 1, true, {}], true)).to.not.throw();
      expect(creator.commands.size).to.equal(1);
      expect(creator.commands.first()).to.be.an.instanceof(commandClass);
    });

    it('throws on non-array arguments', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      // @ts-ignore
      expect(creator.registerCommands.bind(creator, 1)).to.throw();
      // @ts-ignore
      expect(creator.registerCommands.bind(creator, true)).to.throw();
      // @ts-ignore
      expect(creator.registerCommands.bind(creator, {})).to.throw();
    });
  });

  describe('.reregisterCommand()', () => {
    it('re-registers command', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand();
      const commandClass2 = createBasicCommand({ description: 'new desc' });
      creator.registerCommand(commandClass);
      expect(creator.reregisterCommand.bind(creator, commandClass2, creator.commands.first()!)).to.not.throw();
      expect(creator.commands.size).to.equal(1);
      expect(creator.commands.first()).to.be.an.instanceof(commandClass2);
      expect(creator.commands.first()!.description).to.equal('new desc');
    });

    it('re-registers unknown command', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand({ unknown: true });
      const commandClass2 = createBasicCommand({ unknown: true, description: 'new desc' });
      creator.registerCommand(commandClass);
      expect(creator.reregisterCommand.bind(creator, commandClass2, creator.unknownCommand!)).to.not.throw();
      expect(creator.commands.size).to.equal(0);
      expect(creator.unknownCommand).to.be.an.instanceof(commandClass2);
      expect(creator.unknownCommand!.description).to.equal('new desc');
    });

    it('throws on overridding unknown command', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand();
      const commandClass2 = createBasicCommand({ unknown: true, description: 'new desc' });
      creator.registerCommand(commandClass);
      expect(creator.reregisterCommand.bind(creator, commandClass2, creator.commands.first()!)).to.throw();
    });

    it('throws on name/guild mismatch', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand();
      const commandClass2 = createBasicCommand({ name: 'other-command' });
      const commandClass3 = createBasicCommand({ guildID: '1' });
      creator.registerCommand(commandClass);
      expect(creator.reregisterCommand.bind(creator, commandClass2, creator.commands.first()!)).to.throw();
      expect(creator.reregisterCommand.bind(creator, commandClass3, creator.commands.first()!)).to.throw();
    });
  });

  describe('.startServer()', () => {
    it('throws when there is no server given', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      return expect(creator.startServer()).to.eventually.be.rejected;
    });

    it('throws when used on GCFServer', () => {
      const creator = new SlashCreator({
        applicationID: '1',
        publicKey: 'abc'
      });

      creator.withServer(new GCFServer({}));

      return expect(creator.startServer()).to.eventually.be.rejected;
    });

    it('throws when used on GatewayServer', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      creator.withServer(new GatewayServer(() => {}));

      return expect(creator.startServer()).to.eventually.be.rejected;
    });
  });

  describe('.syncCommands()', () => {
    it('syncs commands correctly', async () => {
      const creator = new SlashCreator({
        applicationID: '1',
        token: 'xxx'
      });

      creator
        .registerCommand(createBasicCommand({ name: 'to-create-guild', guildID: '123' }))
        .registerCommand(createBasicCommand({ name: 'to-update' }))
        .registerCommand(createBasicCommand({ name: 'to-leave-alone' }));

      const cmdsScope = globalCommands(basicCommands),
        guildCmdsScope = guildCommands([]),
        postScope = newGuildCommand({
          id: '0',
          name: 'to-create',
          description: 'description',
          application_id: '1'
        }),
        patchScope = updateGlobalCommand('1', {
          id: '1',
          name: 'to-update',
          description: 'description',
          application_id: '1'
        }),
        deleteScope = deleteGlobalCommand('2');

      creator.syncCommands();
      await expect(cmdsScope, 'requests commands').to.have.been.requested;
      await expect(patchScope, 'updates commands').to.have.been.requestedWith({
        name: 'to-update',
        description: 'description'
      });
      await expect(deleteScope, 'deletes old commands').to.have.been.requested;
      await expect(guildCmdsScope, 'requests guild commands').to.have.been.requested;
      await expect(postScope, 'creates new guild commands').to.have.been.requestedWith({
        name: 'to-create-guild',
        description: 'description'
      });
    });
  });

  describe('.syncCommandsIn()', () => {
    it('syncs guild commands correctly', async () => {
      const creator = new SlashCreator({
        applicationID: '1',
        token: 'xxx'
      });

      creator
        .registerCommand(createBasicCommand({ name: 'to-create', guildID: '123' }))
        .registerCommand(createBasicCommand({ name: 'to-update', guildID: '123' }))
        .registerCommand(createBasicCommand({ name: 'to-leave-alone', guildID: '123' }));

      const cmdsScope = guildCommands(basicCommands),
        postScope = newGuildCommand({
          id: '0',
          name: 'to-create',
          description: 'description',
          application_id: '1'
        }),
        patchScope = updateGuildCommand('1', {
          id: '1',
          name: 'to-update',
          description: 'description',
          application_id: '1'
        }),
        deleteScope = deleteGuildCommand('2');

      const promise = expect(creator.syncCommandsIn('123')).to.be.fulfilled;
      await expect(cmdsScope, 'requests commands').to.have.been.requested;
      await expect(patchScope, 'updates commands').to.have.been.requestedWith({
        name: 'to-update',
        description: 'description'
      });
      await expect(deleteScope, 'deletes old commands').to.have.been.requested;
      await expect(postScope, 'creates new commands').to.have.been.requestedWith({
        name: 'to-create',
        description: 'description'
      });
      return promise;
    });
  });

  describe('.syncGlobalCommands()', () => {
    it('syncs global commands correctly', async () => {
      const creator = new SlashCreator({
        applicationID: '1',
        token: 'xxx'
      });

      creator
        .registerCommand(createBasicCommand({ name: 'to-create' }))
        .registerCommand(createBasicCommand({ name: 'to-update' }))
        .registerCommand(createBasicCommand({ name: 'to-leave-alone' }));

      const cmdsScope = globalCommands(basicCommands),
        postScope = newGlobalCommand({
          id: '0',
          name: 'to-create',
          description: 'description',
          application_id: '1'
        }),
        patchScope = updateGlobalCommand('1', {
          id: '1',
          name: 'to-update',
          description: 'description',
          application_id: '1'
        }),
        deleteScope = deleteGlobalCommand('2');

      const promise = expect(creator.syncGlobalCommands()).to.be.fulfilled;
      await expect(cmdsScope, 'requests commands').to.have.been.requested;
      await expect(patchScope, 'updates commands').to.have.been.requestedWith({
        name: 'to-update',
        description: 'description'
      });
      await expect(deleteScope, 'deletes old commands').to.have.been.requested;
      await expect(postScope, 'creates new commands').to.have.been.requestedWith({
        name: 'to-create',
        description: 'description'
      });
      return promise;
    });
  });

  describe('.unregisterCommand()', () => {
    it('unregisters command', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand();
      creator.registerCommand(commandClass);
      expect(creator.unregisterCommand.bind(creator, creator.commands.first()!)).to.not.throw();
      expect(creator.commands.size).to.equal(0);
    });

    it('unregisters unknown command', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      const commandClass = createBasicCommand({ unknown: true });
      creator.registerCommand(commandClass);
      // @ts-ignore
      expect(creator.unregisterCommand.bind(creator, creator.unknownCommand!)).to.not.throw();
      expect(creator.unknownCommand).to.be.undefined;
    });
  });

  describe('.withServer()', () => {
    const fastifyServer = new FastifyServer();

    it('should error if a webserver is given without a public key', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      expect(creator.withServer.bind(creator, fastifyServer)).to.throw();
    });

    it('should succeed if a webserver is given with a public key', () => {
      const creator = new SlashCreator({
        applicationID: '1',
        publicKey: 'abc'
      });

      expect(creator.withServer.bind(creator, fastifyServer)).to.not.throw();
    });

    it('should succeed if a non-web server is given without a public key', () => {
      const creator = new SlashCreator({
        applicationID: '1'
      });

      expect(creator.withServer.bind(creator, new GatewayServer(() => {}))).to.not.throw();
    });
  });
});
