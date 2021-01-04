import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
chai.use(chaiAsPromised);
chai.use(chaiNock);
import 'mocha';
const expect = chai.expect;

import User from '../src/structures/user';
import { creator, userAvatar } from './util/constants';

describe('User', () => {
  describe('constructor', () => {
    it('should apply properties properly', () => {
      const user = new User(userAvatar, creator);

      expect(user).to.include({
        id: userAvatar.id,
        username: userAvatar.username,
        discriminator: userAvatar.discriminator,
        avatar: userAvatar.avatar,
        _flags: userAvatar.public_flags
      });
    });
  });
});
