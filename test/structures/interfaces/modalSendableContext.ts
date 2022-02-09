import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
chai.use(chaiAsPromised);
chai.use(chaiNock);
import 'mocha';
const expect = chai.expect;

import { creator, noop, basicMessageInteraction } from '../../__util__/constants';
import { ModalOptions, ModalSendableContext } from '../../../src/structures/interfaces/modalSendableContext';
import { ComponentType, InteractionResponseType, TextInputStyle } from '../../../src/constants';

describe('ModalSendableContext', () => {
  describe('.sendModal()', () => {
    const baseOptions: ModalOptions = {
      title: 'title',
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.TEXT_INPUT,
              label: 'label',
              custom_id: 'text',
              style: TextInputStyle.SHORT,
              value: 'hi'
            }
          ]
        }
      ]
    };

    it('throws when no callback or custom ID is given', async () => {
      const ctx = new ModalSendableContext(creator, basicMessageInteraction, noop);
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.sendModal(baseOptions)).to.eventually.be.rejected;
      expect(ctx.initiallyResponded).to.equal(false);
    });

    it('sends modals', async () => {
      const ctx = new ModalSendableContext(creator, basicMessageInteraction, async (treq) => {
        expect(treq.body).to.deep.equal({
          type: InteractionResponseType.MODAL,
          data: {
            ...baseOptions,
            custom_id: 'anything'
          }
        });
        expect(treq.status).to.equal(200);
      });
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(
        ctx.sendModal({
          ...baseOptions,
          custom_id: 'anything'
        })
      ).to.eventually.equal('anything');
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('sends modals and generates custom ID if there is a callback', async () => {
      const ctx = new ModalSendableContext(creator, basicMessageInteraction, async (treq) => {
        expect(treq.body).to.deep.include({
          type: InteractionResponseType.MODAL,
          data: baseOptions
        });
        expect(treq.body).to.have.nested.property('data.custom_id').be.a('string');
        expect(treq.status).to.equal(200);
      });
      expect(ctx.initiallyResponded).to.equal(false);
      await expect(ctx.sendModal(baseOptions, () => {})).to.eventually.be.fulfilled;
      expect(ctx.initiallyResponded).to.equal(true);
    });

    it('throws when already responded', async () => {
      const ctx = new ModalSendableContext(creator, basicMessageInteraction, noop);
      ctx.initiallyResponded = true;
      await expect(
        ctx.sendModal({
          ...baseOptions,
          custom_id: 'anything'
        })
      ).to.eventually.be.rejected;
    });
  });
});
