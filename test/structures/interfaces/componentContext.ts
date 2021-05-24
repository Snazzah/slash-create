import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
chai.use(chaiAsPromised);
chai.use(chaiNock);
import 'mocha';
const expect = chai.expect;
import FakeTimers from '@sinonjs/fake-timers';

import { creator, noop, basicMessageInteraction } from '../../__util__/constants';
import ComponentContext from '../../../src/structures/interfaces/componentContext';

describe('ComponentContext', () => {
  describe('constructor', () => {
    it('auto-acknowledges on timeout', function (done) {
      this.timeout(10000);
      this.slow(6000);
      const clock = FakeTimers.install();

      new ComponentContext(creator, basicMessageInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: 6
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

      expect(ctx.message).to.equal(basicMessageInteraction.message);
      expect(ctx.customID).to.equal(basicMessageInteraction.data.custom_id);
      expect(ctx.componentType).to.equal(basicMessageInteraction.data.component_type);
    });
  });

  describe('.acknowledge()', () => {
    it('sends acknowledgements', async () => {
      const ctx = new ComponentContext(creator, basicMessageInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: 6
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
});
