import * as chai from 'chai';
import 'mocha';
const expect = chai.expect;

import { oneLine } from '../src/util';

describe('util', () => {
  describe('oneLine()', () => {
    it('should handle strings with arguments', () => {
      const v = 'apple';
      expect(oneLine`
        pear
        ${v}
        banana
        ${v}
      `).to.equal('pear apple banana apple');
    });

    it('should handle strings with no arguments', () => {
      expect(oneLine`
        pear
        apple
        banana
        apple
      `).to.equal('pear apple banana apple');
    });
  });
});
