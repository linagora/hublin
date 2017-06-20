'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The meetings.user module', function() {

  var $stateParams, userService, session;

  beforeEach(function() {
    module('meetings.user', function($provide) {
      $provide.value('$stateParams', $stateParams = {});
    });
  });

  beforeEach(inject(function(_session_, _userService_) {
    session = _session_;
    userService = _userService_;
  }));

  describe('The getDisplayName function', function() {

    it('should return the displayName in the URL, if given', function() {
      $stateParams.displayName = 'myName';

      expect(userService.getDisplayName()).to.equal('myName');
    });

    it('should return the displayName in the session if user is not anonymous', function() {
      session.user = {
        displayName: 'mySessionName'
      };

      expect(userService.getDisplayName()).to.equal('mySessionName');
    });

    it('should return an empty string if user is anonymous', function() {
      session.user = {
        displayName: 'anonymous'
      };

      expect(userService.getDisplayName()).to.equal('');
    });

    it('should return an empty string if user is not logged-in', function() {
      expect(userService.getDisplayName()).to.equal('');
    });

  });

});
