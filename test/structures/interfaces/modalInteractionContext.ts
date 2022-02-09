import * as chai from 'chai';
import 'mocha';
const expect = chai.expect;
import FakeTimers from '@sinonjs/fake-timers';

import { creator, noop, modalInteraction } from '../../__util__/constants';
import { ModalInteractionContext } from '../../../src/structures/interfaces/modalInteractionContext';
import { InteractionResponseType } from '../../../src/constants';

describe('ModalInteractionContext', () => {
  describe('constructor', () => {
    it('auto-defers on timeout', function (done) {
      this.timeout(10000);
      this.slow(6000);
      const clock = FakeTimers.install();

      new ModalInteractionContext(creator, modalInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          data: { flags: 0 }
        });
        expect(treq.status).to.equal(200);
        done();
      });

      clock.tick(3000);
      clock.uninstall();
    });

    it('assigns properties properly', async () => {
      const ctx = new ModalInteractionContext(creator, modalInteraction, noop);

      expect(ctx.values).to.deep.equal({ text: 'hi' });
      expect(ctx.customID).to.equal('modal');
    });
  });
});
