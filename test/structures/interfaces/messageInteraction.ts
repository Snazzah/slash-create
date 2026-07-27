import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import 'mocha';
const expect = chai.expect;
import { createFollowUp, deleteMessage, editMessage } from '../../__util__/mockAgent';

import { MessageFlags, InteractionResponseType } from '../../../src/constants';
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
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop, undefined);
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
      const ctx = new MessageInteractionContext(
        creator,
        basicInteraction,
        async (treq) => {
          expect(treq.body).to.deep.equal({
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: { flags: 0 }
          });
          expect(treq.status).to.equal(200);
        },
        undefined
      );
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.defer()).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
      expect(ctx.deferred).to.equal(true);
    });

    it('sends ephemeral deferred messages', async () => {
      const ctx = new MessageInteractionContext(
        creator,
        basicInteraction,
        async (treq) => {
          expect(treq.body).to.deep.equal({
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: { flags: MessageFlags.EPHEMERAL }
          });
          expect(treq.status).to.equal(200);
        },
        undefined
      );
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.defer(true)).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
      expect(ctx.deferred).to.equal(true);
    });

    it('returns false when already deferred', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop, undefined);
      await ctx.defer();
      await expect(ctx.defer()).to.eventually.equal(false);
    });
  });

  describe('.send()', () => {
    it('sends regular initial messages', async () => {
      const ctx = new MessageInteractionContext(
        creator,
        basicInteraction,
        async (treq) => {
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
              attachments: undefined,
              poll: undefined
            }
          });
          expect(treq.status).to.equal(200);
        },
        undefined
      );
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.send('test content')).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('sends ephemeral messages', async () => {
      const ctx = new MessageInteractionContext(
        creator,
        basicInteraction,
        async (treq) => {
          expect(treq.body).to.deep.equal({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'test content',
              allowed_mentions: {
                parse: ['roles', 'users']
              },
              embeds: undefined,
              flags: MessageFlags.EPHEMERAL,
              tts: undefined,
              components: undefined,
              attachments: undefined,
              poll: undefined
            }
          });
          expect(treq.status).to.equal(200);
        },
        undefined
      );
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.send({ content: 'test content', ephemeral: true })).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('edits deferred message after sending deferred message', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop, undefined);
      const request = editMessage('@original', followUpMessage);

      await ctx.defer();
      await expect(ctx.send(followUpMessage.content)).to.eventually.be.an.instanceof(Message);
      expect(request.body).to.deep.equal({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: followUpMessage.content
      });
    });

    it('returns follow-up message after initial response', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop, undefined);
      const request = createFollowUp(followUpMessage);

      await ctx.send('111');
      await expect(ctx.send(followUpMessage.content)).to.eventually.be.an.instanceof(Message);
      expect(request.body).to.deep.equal({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: followUpMessage.content
      });
    });
  });

  describe('.sendFollowUp()', () => {
    it('sends follow-up messages', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop, undefined);
      const request = createFollowUp(followUpMessage);

      await ctx.defer();
      await expect(ctx.sendFollowUp(followUpMessage.content)).to.eventually.be.an.instanceof(Message);
      expect(request.body).to.deep.equal({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: followUpMessage.content
      });
    });

    it('throws if creator has no token', async () => {
      const ctx = new MessageInteractionContext(creatorNoToken, basicInteraction, noop, undefined);
      await ctx.defer();
      return expect(ctx.sendFollowUp(followUpMessage.content)).to.be.rejected;
    });
  });

  describe('.edit()', () => {
    it('edits and returns message', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop, undefined);
      const request = editMessage('1234', editedMessage);

      await ctx.defer();
      await expect(ctx.edit('1234', editedMessage.content)).to.eventually.be.an.instanceof(Message);
      expect(request.body).to.deep.equal({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: editedMessage.content
      });
    });
  });

  describe('.editOriginal()', () => {
    it('edits and returns original message', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop, undefined);
      const request = editMessage('@original', editedMessage);

      await ctx.defer();
      await expect(ctx.editOriginal(editedMessage.content)).to.eventually.be.an.instanceof(Message);
      expect(request.body).to.deep.equal({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: editedMessage.content
      });
    });
  });

  describe('.delete()', () => {
    it('deletes original message', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop, undefined);
      deleteMessage('@original');

      await ctx.defer();
      await expect(ctx.delete()).to.eventually.be.fulfilled;
    });

    it('deletes follow-up message', async () => {
      const ctx = new MessageInteractionContext(creator, basicInteraction, noop, undefined);
      deleteMessage('1234');

      await ctx.defer();
      await expect(ctx.delete('1234')).to.eventually.be.fulfilled;
    });
  });
});
