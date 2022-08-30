import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
chai.use(chaiAsPromised);
chai.use(chaiNock);
import 'mocha';
const expect = chai.expect;
import { createFollowUp, deleteMessage, editMessage } from '../../__util__/nock';

import { InteractionResponseFlags, InteractionResponseType } from '../../../src/constants';
import { Message } from '../../../src/structures/message';
import {
  creator,
  creatorNoToken,
  noop,
  basicInteraction,
  followUpMessage,
  editedMessage
} from '../../__util__/constants';
import { MessageInteractionContext } from '../../../src/structures/interfaces/messageInteraction';

describe('MessageInteractionContext', () => {
  describe('constructor', () => {
    it('assigns properties properly', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop);
      await ctx.defer();

      expect(ctx.interactionToken).to.equal(basicInteraction.token);
      expect(ctx.interactionID).to.equal(basicInteraction.id);
      expect(ctx.channelID).to.equal(basicInteraction.channel_id);
      // @ts-expect-error
      expect(ctx.guildID).to.equal(basicInteraction.guild_id);
      // @ts-expect-error
      expect(ctx.user.id).to.equal(basicInteraction.member.user.id);
    });
  });

  describe('.defer()', () => {
    it('sends regular deferred messages', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          data: { flags: 0 }
        });
        expect(treq.status).to.equal(200);
      });
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.defer()).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
      expect(ctx.deferred).to.equal(true);
    });

    it('sends ephemeral deferred messages', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          data: { flags: InteractionResponseFlags.EPHEMERAL }
        });
        expect(treq.status).to.equal(200);
      });
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.defer(true)).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
      expect(ctx.deferred).to.equal(true);
    });

    it('returns false when already deferred', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop);
      await ctx.defer();
      await expect(ctx.defer()).to.eventually.equal(false);
    });
  });

  describe('.send()', () => {
    it('sends regular initial messages', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'test content',
            allowed_mentions: {
              parse: ['roles', 'users']
            },
            embeds: undefined,
            flags: undefined,
            tts: undefined,
            components: undefined,
            attachments: undefined
          }
        });
        expect(treq.status).to.equal(200);
      });
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.send('test content')).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('sends ephemeral messages', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'test content',
            allowed_mentions: {
              parse: ['roles', 'users']
            },
            embeds: undefined,
            flags: InteractionResponseFlags.EPHEMERAL,
            tts: undefined,
            components: undefined,
            attachments: undefined
          }
        });
        expect(treq.status).to.equal(200);
      });
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.send('test content', { ephemeral: true })).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('edits deferred message after sending deferred message', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop);
      const scope = editMessage('@original', followUpMessage);

      await ctx.defer();
      const promise = expect(ctx.send(followUpMessage.content)).to.eventually.be.an.instanceof(Message);
      await expect(scope).to.have.been.requestedWith({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: followUpMessage.content
      });
      return promise;
    });

    it('returns follow-up message after initial response', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop);
      const scope = createFollowUp(followUpMessage);

      await ctx.send('111');
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
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop);
      const scope = createFollowUp(followUpMessage);

      await ctx.defer();
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
      const ctx = new MessageInteractionContext(creatorNoToken, basicInteraction, noop);
      await ctx.defer();
      return expect(ctx.sendFollowUp(followUpMessage.content)).to.be.rejected;
    });
  });

  describe('.edit()', () => {
    it('edits and returns message', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop);
      const scope = editMessage('1234', editedMessage);

      await ctx.defer();
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
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop);
      const scope = editMessage('@original', editedMessage);

      await ctx.defer();
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
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop);
      const scope = deleteMessage('@original');

      await ctx.defer();
      const promise = expect(ctx.delete()).to.eventually.be.fulfilled;
      await expect(scope).to.have.been.requested;
      return promise;
    });

    it('deletes follow-up message', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop);
      const scope = deleteMessage('1234');

      await ctx.defer();
      const promise = expect(ctx.delete('1234')).to.eventually.be.fulfilled;
      await expect(scope).to.have.been.requested;
      return promise;
    });
  });
});
