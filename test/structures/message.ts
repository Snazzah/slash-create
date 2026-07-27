import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import 'mocha';
const expect = chai.expect;

import { CommandContext } from '../../src/structures/interfaces/commandContext';
import { Message } from '../../src/structures/message';
import { basicInteraction, creator, editedMessage, followUpMessage, noop } from '../__util__/constants';
import { deleteMessage, editMessage } from '../__util__/mockAgent';
const ctx = new CommandContext(creator, basicInteraction, noop, false, false, true, null);
ctx.initiallyResponded = true;
// @ts-expect-error
clearTimeout(ctx._timeout);

describe('Message', () => {
  describe('constructor', () => {
    it('should apply properties properly', () => {
      const message = new Message(followUpMessage, creator, ctx);

      expect(message).to.include({
        id: followUpMessage.id,
        type: followUpMessage.type,
        content: followUpMessage.content,
        channelID: followUpMessage.channel_id,
        attachments: followUpMessage.attachments,
        embeds: followUpMessage.embeds,
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
      const message = new Message(followUpMessage, creator, ctx);
      const request = editMessage('1234', editedMessage);

      await expect(message.edit(editedMessage.content)).to.eventually.be.an.instanceof(Message);
      expect(request.body).to.deep.equal({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: editedMessage.content
      });
    });
  });

  describe('.delete()', () => {
    it('deletes message', async () => {
      const message = new Message(followUpMessage, creator, ctx);
      deleteMessage('1234');

      await ctx.defer();
      await expect(message.delete()).to.eventually.be.fulfilled;
    });
  });
});
