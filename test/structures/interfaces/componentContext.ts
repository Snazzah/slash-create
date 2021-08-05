import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
chai.use(chaiAsPromised);
chai.use(chaiNock);
import 'mocha';
const expect = chai.expect;
import FakeTimers from '@sinonjs/fake-timers';

import {
  creator,
  noop,
  basicMessageInteraction,
  followUpMessage,
  selectMessageInteraction
} from '../../__util__/constants';
import ComponentContext from '../../../src/structures/interfaces/componentContext';
import { InteractionResponseType } from '../../../src/constants';
import { editMessage } from '../../__util__/nock';
import Message from '../../../src/structures/message';

describe('ComponentContext', () => {
  describe('constructor', () => {
    it('auto-acknowledges on timeout', function (done) {
      this.timeout(10000);
      this.slow(6000);
      const clock = FakeTimers.install();

      new ComponentContext(creator, basicMessageInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        });
        expect(treq.status).to.equal(200);
        done();
      });

      clock.tick(3000);
      clock.uninstall();
    });

    it('assigns properties properly', async () => {
      const ctx = new ComponentContext(creator, basicMessageInteraction, noop);
      await ctx.acknowledge();

      expect(ctx.message.id).to.equal(basicMessageInteraction.message.id);
      expect(ctx.customID).to.equal(basicMessageInteraction.data.custom_id);
      expect(ctx.componentType).to.equal(basicMessageInteraction.data.component_type);
    });

    it('assigns properties properly for select interactions', async () => {
      const ctx = new ComponentContext(creator, selectMessageInteraction, noop);
      await ctx.acknowledge();

      expect(ctx.message.id).to.equal(selectMessageInteraction.message.id);
      expect(ctx.customID).to.equal(selectMessageInteraction.data.custom_id);
      expect(ctx.componentType).to.equal(selectMessageInteraction.data.component_type);
      expect(ctx.values).to.equal(selectMessageInteraction.data.values);
    });
  });

  describe('.acknowledge()', () => {
    it('sends acknowledgements', async () => {
      const ctx = new ComponentContext(creator, basicMessageInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        });
        expect(treq.status).to.equal(200);
      });
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.acknowledge()).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
      expect(ctx.deferred).to.equal(false);
    });

    it('returns false when already responded', async () => {
      const ctx = new ComponentContext(creator, basicMessageInteraction, noop);
      await ctx.acknowledge();
      await expect(ctx.acknowledge()).to.eventually.equal(false);
    });
  });

  describe('.editParent()', () => {
    it('updates original message initially', async () => {
      const ctx = new ComponentContext(creator, basicMessageInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            content: 'test content',
            allowed_mentions: {
              parse: ['roles', 'users']
            },
            embeds: undefined,
            components: undefined
          }
        });
        expect(treq.status).to.equal(200);
      });
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.editParent('test content')).to.eventually.equal(true);
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('edits original message after acknowledging', async () => {
      const ctx = new ComponentContext(creator, basicMessageInteraction, noop);
      const scope = editMessage(basicMessageInteraction.message.id, followUpMessage);

      await ctx.acknowledge();
      const promise = expect(ctx.editParent(followUpMessage.content)).to.eventually.be.an.instanceof(Message);
      await expect(scope).to.have.been.requestedWith({
        allowed_mentions: {
          parse: ['roles', 'users']
        },
        content: followUpMessage.content
      });
      return promise;
    });
  });
});
