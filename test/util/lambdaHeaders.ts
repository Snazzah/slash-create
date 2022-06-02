import * as chai from 'chai';
import 'mocha';
const expect = chai.expect;

import { splitHeaders, joinHeaders } from '../../src/util/lambdaHeaders';

describe('util/lambdaHeaders', () => {
  describe('splitHeaders()', () => {
    it('should handle undefined input properly', () => {
      const arrayHeaders = splitHeaders(undefined);
      expect(arrayHeaders).to.be.an('object').that.is.empty;
    });

    it('should pass single value headers', () => {
      const singleValueHeaders = { testName: 'testValue', testName2: 'testValue2' };
      const arrayHeaders = splitHeaders(singleValueHeaders);

      const expectedHeaders = { testname: 'testValue', testname2: 'testValue2' };
      expect(arrayHeaders).to.deep.equal(expectedHeaders);
    });

    it('should pass undefined header values', () => {
      const undefinedHeader = { undefinedName: undefined };
      const arrayHeaders = splitHeaders(undefinedHeader);

      const expectedHeader = { undefinedname: undefined };
      expect(arrayHeaders).to.deep.equal(expectedHeader);
    });

    it('should split multi-value headers', () => {
      const multiValueHeader = { multiValue: 'test1,test2' };
      const arrayHeaders = splitHeaders(multiValueHeader);

      const expectedHeader = { multivalue: ['test1', 'test2'] };
      expect(arrayHeaders).to.deep.equal(expectedHeader);
    });

    it('should handle mixed header types', () => {
      const mixedHeaders = { singleType: 'abc', multiType: 'def,ghi' };
      const arrayHeaders = splitHeaders(mixedHeaders);

      const expectedHeaders = { singletype: 'abc', multitype: ['def', 'ghi'] };
      expect(arrayHeaders).to.deep.equal(expectedHeaders);
    });

    it('should support custom separators', () => {
      const testHeaders = { name: 'value1;value2' };
      const arrayHeaders = splitHeaders(testHeaders, ';');

      const expectedHeaders = { name: ['value1', 'value2'] };
      expect(arrayHeaders).to.deep.equal(expectedHeaders);
    });
  });

  describe('joinHeaders()', () => {
    it('should handle undefined input properly', () => {
      const arrayHeaders = joinHeaders(undefined);
      expect(arrayHeaders).to.be.an('object').that.is.empty;
    });

    it('should pass single value headers', () => {
      const singleValueHeaders = { testName: 'testValue', testName2: 'testValue2' };
      const arrayHeaders = joinHeaders(singleValueHeaders);

      const expectedHeaders = { testname: 'testValue', testname2: 'testValue2' };
      expect(arrayHeaders).to.deep.equal(expectedHeaders);
    });

    it('should drop headers with undefined values', () => {
      const undefinedHeader = { undefinedName: undefined };
      const arrayHeaders = joinHeaders(undefinedHeader);
      expect(arrayHeaders).to.be.an('object').that.is.empty;
    });

    it('should join multi-value headers', () => {
      const multiValueHeader = { multiValue: ['test1', 'test2'] };
      const arrayHeaders = joinHeaders(multiValueHeader);

      const expectedHeader = { multivalue: 'test1,test2' };
      expect(arrayHeaders).to.deep.equal(expectedHeader);
    });

    it('should handle mixed header types', () => {
      const mixedHeaders = { singleType: 'abc', multiType: ['def', 'ghi'] };
      const arrayHeaders = joinHeaders(mixedHeaders);

      const expectedHeaders = { singletype: 'abc', multitype: 'def,ghi' };
      expect(arrayHeaders).to.deep.equal(expectedHeaders);
    });

    it('should support custom separators', () => {
      const testHeaders = { name: ['value1', 'value2'] };
      const arrayHeaders = joinHeaders(testHeaders, ';');

      const expectedHeaders = { name: 'value1;value2' };
      expect(arrayHeaders).to.deep.equal(expectedHeaders);
    });
  });
});
