import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
chai.use(chaiAsPromised);
chai.use(chaiNock);
import 'mocha';
const expect = chai.expect;
import FakeTimers from '@sinonjs/fake-timers';

import { InteractionResponseType } from '../../../src/constants';
import { CommandContext } from '../../../src/structures/interfaces/commandContext';
import {
  creator,
  noop,
  basicInteraction,
  subCommandInteraction,
  subCommandGroupInteraction,
  optionsInteraction,
  subCommandOptionsInteraction
} from '../../__util__/constants';

describe('CommandContext', () => {
  describe('constructor', () => {
    it('auto-defers on timeout', function (done) {
      this.timeout(10000);
      this.slow(6000);
      const clock = FakeTimers.install();

      new CommandContext(
        creator,
        basicInteraction,
        async (treq) => {
          expect(treq.body).to.deep.equal({
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: { flags: 0 }
          });
          expect(treq.status).to.equal(200);
          done();
        },
        false,
        undefined,
        undefined,
        undefined
      );

      clock.tick(3000);
      clock.uninstall();
    });

    describe('For an interaction with no options', () => {
      const ctx = new CommandContext(creator, basicInteraction, noop, false, undefined, undefined, undefined);

      it('does not have options in the context', () => expect(ctx.options).to.deep.equal({}));
      it('does not have subcommands in the context', () => expect(ctx.subcommands).to.deep.equal([]));
    });

    describe('For an interaction with options', () => {
      const ctx = new CommandContext(creator, optionsInteraction, noop, false, undefined, undefined, undefined);

      it('has options in the context', () => expect(ctx.options).to.deep.equal({ string: 'hi', int: 2, bool: true }));
      it('does not have subcommands in the context', () => expect(ctx.subcommands).to.deep.equal([]));
    });

    describe('For an interaction with a sub-command', () => {
      const ctx = new CommandContext(creator, subCommandInteraction, noop, false, undefined, undefined, undefined);

      it('has an empty options object within the sub-command', () =>
        expect(ctx.options).to.deep.equal({ 'sub-command': {} }));
      it('has a subcommand in the context', () => expect(ctx.subcommands).to.deep.equal(['sub-command']));
    });

    describe('For an interaction with a sub-command group', () => {
      const ctx = new CommandContext(creator, subCommandGroupInteraction, noop, false, undefined, undefined, undefined);

      it('has an empty options object within the sub-command group', () =>
        expect(ctx.options).to.deep.equal({ 'sub-command-group': { 'sub-command': {} } }));
      it('has subcommands in the context', () =>
        expect(ctx.subcommands).to.deep.equal(['sub-command-group', 'sub-command']));
    });

    describe('For an interaction with a sub-command with options', () => {
      const ctx = new CommandContext(
        creator,
        subCommandOptionsInteraction,
        noop,
        false,
        undefined,
        undefined,
        undefined
      );

      it('has options within the sub-command', () =>
        expect(ctx.options).to.deep.equal({ 'sub-command': { string: 'hi', int: 2, bool: true } }));
      it('has subcommands in the context', () => expect(ctx.subcommands).to.deep.equal(['sub-command']));
    });

    it('assigns properties properly', async () => {
      const ctx = new CommandContext(creator, basicInteraction, noop, false, undefined, undefined, undefined);
      await ctx.defer();

      expect(ctx.users.size).to.equal(0);
      expect(ctx.channels.size).to.equal(0);
      expect(ctx.members.size).to.equal(0);
      expect(ctx.roles.size).to.equal(0);
      expect(ctx.commandID).to.equal(basicInteraction.data.id);
      expect(ctx.commandName).to.equal(basicInteraction.data.name);
    });
  });
});
