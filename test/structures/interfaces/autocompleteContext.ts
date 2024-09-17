import * as chai from 'chai';
import 'mocha';
const expect = chai.expect;

import { creator, noop, autocompleteInteraction } from '../../__util__/constants';
import { AutocompleteContext } from '../../../src/structures/interfaces/autocompleteContext';

describe('AutocompleteContext', () => {
  describe('constructor', () => {
    it('assigns properties properly', async () => {
      const ctx = new AutocompleteContext(creator, autocompleteInteraction, noop, undefined);

      expect(ctx.options).to.deep.equal({ 'sub-command': { string: 'incomplete str' } });
      expect(ctx.subcommands).to.deep.equal(['sub-command']);
      expect(ctx.focused).to.equal('string');
    });
  });
});
