'use strict';

var expect = require('chai').expect;

var MAX_CONFERENCE_NAME_LENGTH = require('../../../../backend/constants').MAX_CONFERENCE_NAME_LENGTH;
var MIN_CONFERENCE_NAME_LENGTH = require('../../../../backend/constants').MIN_CONFERENCE_NAME_LENGTH;

describe('The conference helpers', function() {

  describe('The isIdTooLong function', function() {

    it('should send false if id length is lower than limit', function() {
      expect(this.helpers.requireBackend('core/conference/helpers').isIdTooLong(this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH - 1))).to.be.false;
    });

    it('should send false if id length is equals to limit', function() {
      expect(this.helpers.requireBackend('core/conference/helpers').isIdTooLong(this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH))).to.be.false;
    });

    it('should send true if id length is greater than limit', function() {
      expect(this.helpers.requireBackend('core/conference/helpers').isIdTooLong(this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH + 1))).to.be.true;
    });

  });

  describe('The isIdTooShort function', function() {

    it('should send true if id length is lower than limit', function() {
      expect(this.helpers.requireBackend('core/conference/helpers').isIdTooShort(this.helpers.utils.generateStringWithLength(MIN_CONFERENCE_NAME_LENGTH - 1))).to.be.true;
    });

    it('should send false if id length is equals to limit', function() {
      expect(this.helpers.requireBackend('core/conference/helpers').isIdTooLong(this.helpers.utils.generateStringWithLength(MIN_CONFERENCE_NAME_LENGTH))).to.be.false;
    });

    it('should send false if id length is greater than limit', function() {
      expect(this.helpers.requireBackend('core/conference/helpers').isIdTooLong(this.helpers.utils.generateStringWithLength(MIN_CONFERENCE_NAME_LENGTH + 1))).to.be.false;
    });
  });
});
