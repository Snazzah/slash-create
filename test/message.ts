import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
chai.use(chaiAsPromised);
chai.use(chaiNock);
import 'mocha';
const expect = chai.expect;

import CommandContext from '../src/context';
import Message from '../src/structures/message';
import { basicInteraction, creator, editedMessage, followUpMessage, noop } from './util/constants';
import { deleteMessage, editMessage } from './util/nock';
const ctx = new CommandContext(creator, basicInteraction, noop, false);
ctx.initiallyResponded = true;
// @ts-expect-error
clearTimeout(ctx._timeout);

describe('Message', () => {
  describe('constructor', () => {
    it('should apply properties properly', () => {
      const message = new Message(followUpMessage, ctx);

      expect(message).to.include({
        id: followUpMessage.id,
        type: followUpMessage.type,
        content: followUpMessage.content,
        channelID: followUpMessage.channel_id,
        attachments: followUpMessage.attachments,
        embeds: followUpMessage.embeds,
        mentions: followUpMessage.mentions,
        roleMentions: followUpMessage.mention_roles,
        mentionedEveryone: followUpMessage.mention_everyone,
        timestamp: Date.parse(followUpMessage.timestamp),
        tts: followUpMessage.tts,
        flags: followUpMessage.flags,
        webhookID: followUpMessage.webhook_id
      });

      expect(message.author).to.include({
        id: followUpMessage.author.id,
        username: followUpMessage.author.username,
        discriminator: followUpMessage.author.discriminator,
        _flags: followUpMessage.author.public_flags,
        bot: followUpMessage.author.bot
      });
    });
  });

  describe('.edit()', () => {
    it('edits and returns message', async () => {
      const message = new Message(followUpMessage, ctx);
      const scope = editMessage('1234', editedMessage);

      const promise = expect(message.edit(editedMessage.content)).to.eventually.be.an.instanceof(Message);
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
    it('deletes message', async () => {
      const message = new Message(followUpMessage, ctx);
      const scope = deleteMessage('1234');

      await ctx.acknowledge();
      const promise = expect(message.delete()).to.eventually.be.fulfilled;
      await expect(scope).to.have.been.requested;
      return promise;
    });
  });
});
