import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
chai.use(chaiAsPromised);
chai.use(chaiNock);
import 'mocha';
const expect = chai.expect;
import FakeTimers from '@sinonjs/fake-timers';
import { createFollowUp, deleteMessage, editMessage } from './util/nock';

import { InteractionResponseFlags, InterationResponseType } from '../src/constants';
import CommandContext from '../src/context';
import Message from '../src/structures/message';
import {
  creator,
  creatorNoToken,
  noop,
  basicInteraction,
  subCommandInteraction,
  subCommandGroupInteraction,
  optionsInteraction,
  subCommandOptionsInteraction,
  followUpMessage,
  editedMessage
} from './util/constants';

describe('CommandContext', () => {
  describe('constructor', () => {
    it('auto-acknowledges on timeout', function (done) {
      this.timeout(10000);
      this.slow(6000);
      const clock = FakeTimers.install();

      new CommandContext(
        creator,
        basicInteraction,
        async (treq) => {
          expect(treq.body).to.deep.equal({
            type: InterationResponseType.ACKNOWLEDGE
          });
          expect(treq.status).to.equal(200);
          done();
        },
        false
      );

      clock.tick(3000);
      clock.uninstall();
    });

    describe('For an interaction with no options', () => {
      const ctx = new CommandContext(creator, basicInteraction, noop, false);

      it('does not have options in the context', () => expect(ctx.options).to.deep.equal({}));
      it('does not have subcommands in the context', () => expect(ctx.subcommands).to.deep.equal([]));
    });

    describe('For an interaction with options', () => {
      const ctx = new CommandContext(creator, optionsInteraction, noop, false);

      it('has options in the context', () => expect(ctx.options).to.deep.equal({ string: 'hi', int: 2, bool: true }));
      it('does not have subcommands in the context', () => expect(ctx.subcommands).to.deep.equal([]));
    });

    describe('For an interaction with a sub-command', () => {
      const ctx = new CommandContext(creator, subCommandInteraction, noop, false);

      it('has an empty options object within the sub-command', () =>
        expect(ctx.options).to.deep.equal({ 'sub-command': {} }));
      it('has a subcommand in the context', () => expect(ctx.subcommands).to.deep.equal(['sub-command']));
    });

    describe('For an interaction with a sub-command group', () => {
      const ctx = new CommandContext(creator, subCommandGroupInteraction, noop, false);

      it('has an empty options object within the sub-command group', () =>
        expect(ctx.options).to.deep.equal({ 'sub-command-group': { 'sub-command': {} } }));
      it('has subcommands in the context', () =>
        expect(ctx.subcommands).to.deep.equal(['sub-command-group', 'sub-command']));
    });

    describe('For an interaction with a sub-command with options', () => {
      const ctx = new CommandContext(creator, subCommandOptionsInteraction, noop, false);

      it('has options within the sub-command', () =>
        expect(ctx.options).to.deep.equal({ 'sub-command': { string: 'hi', int: 2, bool: true } }));
      it('has subcommands in the context', () => expect(ctx.subcommands).to.deep.equal(['sub-command']));
    });
  });

  describe('.acknowledge()', () => {
    it('sends regular acknowledgements', async () => {
      const ctx = new CommandContext(
        creator,
        basicInteraction,
        async (treq) => {
          expect(treq.body).to.deep.equal({
            type: InterationResponseType.ACKNOWLEDGE
          });
          expect(treq.status).to.equal(200);
        },
        false
      );
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.acknowledge()).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('sends sourced acknowledgements', async () => {
      const ctx = new CommandContext(
        creator,
        basicInteraction,
        async (treq) => {
          expect(treq.body).to.deep.equal({
            type: InterationResponseType.ACKNOWLEDGE_WITH_SOURCE
          });
          expect(treq.status).to.equal(200);
        },
        false
      );
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.acknowledge(true)).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('returns false when already responded', async () => {
      const ctx = new CommandContext(creator, basicInteraction, noop, false);
      await ctx.acknowledge();
      await expect(ctx.acknowledge()).to.eventually.equal(false);
    });
  });

  describe('.send()', () => {
    it('sends regular initial messages', async () => {
      const ctx = new CommandContext(
        creator,
        basicInteraction,
        async (treq) => {
          expect(treq.body).to.deep.equal({
            type: InterationResponseType.CHANNEL_MESSAGE,
            data: {
              content: 'test content',
              allowed_mentions: {
                parse: ['roles', 'users']
              },
              embeds: undefined,
              flags: undefined,
              tts: undefined
            }
          });
          expect(treq.status).to.equal(200);
        },
        false
      );
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.send('test content')).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('sends ephemeral messages', async () => {
      const ctx = new CommandContext(
        creator,
        basicInteraction,
        async (treq) => {
          expect(treq.body).to.deep.equal({
            type: InterationResponseType.CHANNEL_MESSAGE,
            data: {
              content: 'test content',
              allowed_mentions: {
                parse: ['roles', 'users']
              },
              embeds: undefined,
              flags: InteractionResponseFlags.EPHEMERAL,
              tts: undefined
            }
          });
          expect(treq.status).to.equal(200);
        },
        false
      );
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.send('test content', { ephemeral: true })).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('sends sourced messages', async () => {
      const ctx = new CommandContext(
        creator,
        basicInteraction,
        async (treq) => {
          expect(treq.body).to.deep.equal({
            type: InterationResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'test content',
              allowed_mentions: {
                parse: ['roles', 'users']
              },
              embeds: undefined,
              flags: undefined,
              tts: undefined
            }
          });
          expect(treq.status).to.equal(200);
        },
        false
      );
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.send('test content', { includeSource: true })).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('returns follow-up message after initial response', async () => {
      const ctx = new CommandContext(creator, basicInteraction, noop, false);
      const scope = createFollowUp(followUpMessage);

      await ctx.acknowledge();
      const promise = expect(ctx.send(followUpMessage.content)).to.eventually.be.an.instanceof(Message);
      await expect(scope).to.have.been.requestedWith({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: followUpMessage.content
      });
      return promise;
    });
  });

  describe('.sendFollowUp()', () => {
    it('sends follow-up messages', async () => {
      const ctx = new CommandContext(creator, basicInteraction, noop, false);
      const scope = createFollowUp(followUpMessage);

      await ctx.acknowledge();
      const promise = expect(ctx.sendFollowUp(followUpMessage.content)).to.eventually.be.an.instanceof(Message);
      await expect(scope).to.have.been.requestedWith({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: followUpMessage.content
      });
      return promise;
    });

    it('throws if creator has no token', async () => {
      const ctx = new CommandContext(creatorNoToken, basicInteraction, noop, false);
      await ctx.acknowledge();
      return expect(ctx.sendFollowUp(followUpMessage.content)).to.be.rejected;
    });
  });

  describe('.edit()', () => {
    it('edits and returns message', async () => {
      const ctx = new CommandContext(creator, basicInteraction, noop, false);
      const scope = editMessage('1234', editedMessage);

      await ctx.acknowledge();
      const promise = expect(ctx.edit('1234', editedMessage.content)).to.eventually.be.an.instanceof(Message);
      await expect(scope).to.have.been.requestedWith({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: editedMessage.content
      });
      return promise;
    });
  });

  describe('.editOriginal()', () => {
    it('edits and returns original message', async () => {
      const ctx = new CommandContext(creator, basicInteraction, noop, false);
      const scope = editMessage('@original', editedMessage);

      await ctx.acknowledge();
      const promise = expect(ctx.editOriginal(editedMessage.content)).to.eventually.be.an.instanceof(Message);
      await expect(scope).to.have.been.requestedWith({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: editedMessage.content
      });
      return promise;
    });
  });

  describe('.delete()', () => {
    it('deletes original message', async () => {
      const ctx = new CommandContext(creator, basicInteraction, noop, false);
      const scope = deleteMessage('@original');

      await ctx.acknowledge();
      const promise = expect(ctx.delete()).to.eventually.be.fulfilled;
      await expect(scope).to.have.been.requested;
      return promise;
    });

    it('deletes follow-up message', async () => {
      const ctx = new CommandContext(creator, basicInteraction, noop, false);
      const scope = deleteMessage('1234');

      await ctx.acknowledge();
      const promise = expect(ctx.delete('1234')).to.eventually.be.fulfilled;
      await expect(scope).to.have.been.requested;
      return promise;
    });
  });
});
