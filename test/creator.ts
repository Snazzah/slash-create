import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
chai.use(chaiAsPromised);
chai.use(chaiNock);
import 'mocha';
const expect = chai.expect;

import { SlashCreator } from '../src/creator';
import { FastifyServer } from '../src/servers/fastify';
import { GatewayServer } from '../src/servers/gateway';
import { GCFServer } from '../src/servers/gcf';
import { ApplicationCommandPermissionType, ApplicationCommandType } from '../src/constants';
import { createBasicCommand } from './__util__/commands';
import { basicCommands } from './__util__/constants';
import {
  globalCommands,
  guildCommands,
  updateGlobalCommands,
  updateGuildCommandPermissions,
  updateGuildCommands
} from './__util__/nock';

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
        disableTimeouts: false,
        unknownCommandResponse: true,
        handleCommandsManually: false,
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

  describe('.registerCommands()', () => {
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
      const commandClass3 = createBasicCommand({ guildIDs: '1' });
      creator.registerCommand(commandClass);
      expect(creator.reregisterCommand.bind(creator, commandClass2, creator.commands.first()!)).to.throw();
      expect(creator.reregisterCommand.bind(creator, commandClass3, creator.commands.first()!)).to.throw();
    });
  });

  describe('.syncCommands()', () => {
    it('syncs commands correctly', async () => {
      const creator = new SlashCreator({
        applicationID: '1',
        token: 'xxx'
      });

      creator
        .registerCommand(createBasicCommand({ name: 'to-create-guild', guildIDs: '123' }))
        .registerCommand(
          createBasicCommand({
            name: 'to-update',
            dmPermission: false,
            permissions: {
              '123': [
                {
                  type: ApplicationCommandPermissionType.USER,
                  id: '1',
                  permission: true
                }
              ]
            }
          })
        )
        .registerCommand(createBasicCommand({ name: 'to-leave-alone' }));

      const cmdsScope = globalCommands(basicCommands),
        guildCmdsScope = guildCommands([]),
        putScope = updateGlobalCommands([
          {
            id: '1',
            name: 'to-update',
            description: 'description',
            application_id: '1',
            version: '1',
            type: ApplicationCommandType.CHAT_INPUT
          }
        ]),
        putGuildScope = updateGuildCommands([
          {
            id: '1',
            name: 'to-update',
            description: 'description',
            application_id: '1',
            version: '1',
            type: ApplicationCommandType.CHAT_INPUT
          }
        ]),
        permissionsScope = updateGuildCommandPermissions([
          {
            application_id: '1',
            id: '1',
            guild_id: '123',
            permissions: [
              {
                type: ApplicationCommandPermissionType.USER,
                id: '1',
                permission: true
              }
            ]
          }
        ]);

      creator.syncCommands();
      await expect(cmdsScope, 'requests commands').to.have.been.requested;
      await expect(putScope, 'updates commands').to.have.been.requestedWith([
        {
          id: '1',
          default_member_permissions: null,
          default_permission: true,
          dm_permission: false,
          name: 'to-update',
          description: 'description',
          type: ApplicationCommandType.CHAT_INPUT
        },
        {
          id: '3',
          default_member_permissions: null,
          default_permission: true,
          dm_permission: true,
          name: 'to-leave-alone',
          description: 'description',
          type: ApplicationCommandType.CHAT_INPUT
        }
      ]);
      await expect(guildCmdsScope, 'requests guild commands').to.have.been.requested;
      await expect(putGuildScope, 'updates guild commands').to.have.been.requestedWith([
        {
          default_member_permissions: null,
          default_permission: true,
          name: 'to-create-guild',
          description: 'description',
          type: ApplicationCommandType.CHAT_INPUT
        }
      ]);
      await expect(permissionsScope, 'updates command permissions').to.have.been.requestedWith([
        {
          id: '1',
          permissions: [
            {
              type: ApplicationCommandPermissionType.USER,
              id: '1',
              permission: true
            }
          ]
        }
      ]);
    });
  });

  describe('.syncCommandsIn()', () => {
    it('syncs guild commands correctly', async () => {
      const creator = new SlashCreator({
        applicationID: '1',
        token: 'xxx'
      });

      creator
        .registerCommand(createBasicCommand({ name: 'to-create', guildIDs: '123' }))
        .registerCommand(createBasicCommand({ name: 'to-update', guildIDs: '123' }))
        .registerCommand(createBasicCommand({ name: 'to-leave-alone', guildIDs: '123' }));

      const cmdsScope = guildCommands(basicCommands),
        putScope = updateGuildCommands([
          {
            id: '1',
            name: 'to-update',
            description: 'description',
            guild_id: '123',
            application_id: '1',
            version: '1',
            type: ApplicationCommandType.CHAT_INPUT
          }
        ]);

      const promise = expect(creator.syncCommandsIn('123')).to.be.fulfilled;
      await expect(cmdsScope, 'requests commands').to.have.been.requested;
      await expect(putScope, 'updates commands').to.have.been.requestedWith([
        {
          id: '1',
          default_member_permissions: null,
          default_permission: true,
          name: 'to-update',
          description: 'description',
          type: ApplicationCommandType.CHAT_INPUT
        },
        {
          id: '3',
          default_member_permissions: null,
          default_permission: true,
          name: 'to-leave-alone',
          description: 'description',
          type: ApplicationCommandType.CHAT_INPUT
        },
        {
          default_member_permissions: null,
          default_permission: true,
          name: 'to-create',
          description: 'description',
          type: ApplicationCommandType.CHAT_INPUT
        }
      ]);
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
        putScope = updateGlobalCommands([
          {
            id: '1',
            name: 'to-update',
            description: 'description',
            application_id: '1',
            version: '1'
          }
        ]);

      const promise = expect(creator.syncGlobalCommands()).to.be.fulfilled;
      await expect(cmdsScope, 'requests commands').to.have.been.requested;
      await expect(putScope, 'updates commands').to.have.been.requestedWith([
        {
          id: '1',
          default_member_permissions: null,
          default_permission: true,
          dm_permission: true,
          name: 'to-update',
          description: 'description',
          type: ApplicationCommandType.CHAT_INPUT
        },
        {
          id: '3',
          default_member_permissions: null,
          default_permission: true,
          dm_permission: true,
          name: 'to-leave-alone',
          description: 'description',
          type: ApplicationCommandType.CHAT_INPUT
        },
        {
          default_member_permissions: null,
          default_permission: true,
          dm_permission: true,
          name: 'to-create',
          description: 'description',
          type: ApplicationCommandType.CHAT_INPUT
        }
      ]);
      return promise;
    });
  });

  describe('.syncCommandPermissions()', () => {
    it('syncs command permissions correctly', async () => {
      const creator = new SlashCreator({
        applicationID: '1',
        token: 'xxx'
      });

      creator.registerCommand(
        createBasicCommand(
          {
            name: 'to-update',
            permissions: {
              '123': [
                {
                  type: ApplicationCommandPermissionType.USER,
                  id: '1',
                  permission: true
                }
              ]
            }
          },
          [['123', '1']]
        )
      );

      const permissionsScope = updateGuildCommandPermissions([
        {
          application_id: '1',
          id: '1',
          guild_id: '123',
          permissions: [
            {
              type: ApplicationCommandPermissionType.USER,
              id: '1',
              permission: true
            }
          ]
        }
      ]);

      creator.syncCommandPermissions();
      await expect(permissionsScope, 'updates command permissions').to.have.been.requestedWith([
        {
          id: '1',
          permissions: [
            {
              type: ApplicationCommandPermissionType.USER,
              id: '1',
              permission: true
            }
          ]
        }
      ]);
    });
  });

  describe('.collectCommandIDs()', () => {
    it('collects command IDs', async () => {
      const creator = new SlashCreator({
        applicationID: '1',
        token: 'xxx'
      });

      creator.registerCommand(createBasicCommand({ name: 'to-update' }));

      const cmdsScope = globalCommands(basicCommands);

      const promise = expect(creator.collectCommandIDs()).to.eventually.be.fulfilled;
      await expect(cmdsScope, 'requests global commands').to.have.been.requested;
      await promise;
      expect(creator.commands.first()!.ids.get('global')).to.equal('1');
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
});
