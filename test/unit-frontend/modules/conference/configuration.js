'use strict';

/* global chai: false */

var expect = chai.expect;


describe('The meetings.configuration module', function() {

  var easyRTCService, easyRTCBitRates, easyRTCDefaultBitRate;

  beforeEach(function() {
    module('meetings.configuration');
    module('meetings.jade.templates');
  });

  beforeEach(angular.mock.module(function($provide) {
    easyRTCBitRates = {rate1: 'config1', rate2: 'config2'};
    easyRTCDefaultBitRate = 'rate2';
    easyRTCService = {};
    $provide.value('easyRTCService', easyRTCService);
    $provide.value('easyRTCBitRates', easyRTCBitRates);
    $provide.value('easyRTCDefaultBitRate', easyRTCDefaultBitRate);
  }));

  describe('The conferenceConfiguration directive', function() {

    beforeEach(inject(function($compile, $rootScope) {
      this.scope = $rootScope.$new();
      this.compile = $compile;
      this.compile('<conference-configuration />')(this.scope);
      this.scope.$digest();
    }));

    describe('the onUsernameChange function', function() {
      before(function() {
        this.generateString = function(length) {
          return new Array(length + 1).join('a');
        };
      });

      it('should do nothing if configuration.display.username is undefined', function() {
        this.scope.configuration = {};
        this.scope.onUsernameChange();
        expect(this.scope.configuration).to.deep.equal({});
        expect(this.scope.lengthError).to.be.false;
      });

      it('should do nothing if configuration.display.username is not too long', function() {
        var userName = 'aName';
        this.scope.configuration = {
          displayName: userName
        };
        this.scope.onUsernameChange();
        expect(this.scope.configuration.displayName).to.deep.equal(userName);
        expect(this.scope.lengthError).to.be.false;
      });

      it('should set lengthError to true if configuration.display.username is not 199 chars long', function() {
        var userName = this.generateString(199);
        this.scope.configuration = {
          displayName: userName
        };
        this.scope.onUsernameChange();
        expect(this.scope.configuration.displayName).to.deep.equal(userName);
        expect(this.scope.lengthError).to.be.true;
      });

      it('should set lengthError to true and truncate username if configuration.display.username is 200 chars long', function() {
        var userName = this.generateString(200);
        this.scope.configuration = {
          displayName: userName
        };
        this.scope.onUsernameChange();
        expect(this.scope.configuration.displayName).to.deep.equal(this.generateString(199));
        expect(this.scope.lengthError).to.be.true;
      });

      it('should set lengthError to true and truncate username if configuration.display.username is more than 200 chars long', function() {
        var userName = this.generateString(250);
        this.scope.configuration = {
          displayName: userName
        };
        this.scope.onUsernameChange();
        expect(this.scope.configuration.displayName).to.deep.equal(this.generateString(199));
        expect(this.scope.lengthError).to.be.true;
      });
    });

  });

});
