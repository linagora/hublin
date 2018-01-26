'use strict';

/* global chai */
var expect = chai.expect;

describe('The op.live-conference-devmode module', function() {
  var self = this;

  beforeEach(function() {
    angular.mock.module('op.live-conference-devmode');
  });

  describe('devMode service', function() {

    beforeEach(function() {
      self.conference = {
        getAttendees: function() { return []; }
      };
      self.webRTCService = {
        myEasyrtcid: function() { },
        getP2PConnectionStatus: function() { },
        doesDataChannelWork: function() { return true; }
      };
    });

    describe('enable() method', function() {
      it('should register a callback in $interval', function(done) {
        var $interval = function(callback, ms) {
          expect(callback).to.be.a('function');
          expect(ms).to.be.a.number;
          expect(ms).to.equal(1000);
          done();
        };

        module(function($provide) {
          $provide.value('currentConferenceState', self.conference);
          $provide.value('webRTCService', self.webRTCService);
          $provide.value('$interval', $interval);
        });

        inject(function(devMode) {
          devMode.enable();
        });
      });
    });

    describe('setDevModePeerListeners', function() {
      it('should call setPeerListener for all devmodeMsgType values', function(done) {
        var handler = 'aHandler';
        var count = 0;

        self.webRTCService.setPeerListener = function(listener, msgType) {
          expect(listener).to.deep.equal(handler);
          count++;
          if (count === 1) {
            expect(msgType).to.equal('devmode:sendData');
          } else if (count === 2) {
            expect(msgType).to.equal('devmode:sendDataP2P');
          } else if (count === 3) {
            expect(msgType).to.equal('devmode:sendDataWS');
            done();
          }
        };

        module(function($provide) {
          $provide.value('currentConferenceState', self.conference);
          $provide.value('webRTCService', self.webRTCService);
        });

        inject(function(devMode) {
          devMode.setDevModePeerListeners(handler);
        });
      });
    });
  });
  describe('disable() method', function() {
    it('should unregister $interval\'s callback', function(done) {
      var $interval = function() {
        return 'token1';
      };

      $interval.cancel = function(token) {
        expect(token).to.equal('token1');
        done();
      };

      module(function($provide) {
        $provide.value('currentConferenceState', self.conference);
        $provide.value('webRTCService', self.webRTCService);
        $provide.value('$interval', $interval);
      });

      inject(function(devMode) {
        devMode.enable();
        devMode.disable();
      });
    });
  });
  describe('enable() callback', function() {
    beforeEach(function() {

      module(function($provide) {
        $provide.value('currentConferenceState', self.conference);
        $provide.value('webRTCService', self.webRTCService);
      });
      inject(function($interval, devMode) {
        self.$interval = $interval;
        self.devMode = devMode;
      });
    });
    it('should expose an attendees array', function() {
      self.webRTCService.myEasyrtcid = function() {
        return 'local';
      };
      self.conference.getAttendees = function() {
        return [
          { easyrtcid: 'local', displayName: 'localName' },
          { easyrtcid: 'remote1', displayName: 'remote1Name' },
          { easyrtcid: 'remote2', displayName: 'remote2Name' }
        ];
      };
      self.devMode.enable();
      self.$interval.flush(1000);
      expect(self.devMode.attendees).to.deep.equal([
        {},
        { easyrtcid: 'remote1', displayName: 'remote1Name', connectionStatusMessage: undefined, connectionStatus: true, dataChannelStatus: true },
        { easyrtcid: 'remote2', displayName: 'remote2Name', connectionStatusMessage: undefined, connectionStatus: true, dataChannelStatus: true }
      ]);
    });
    it('should expose the number of peers', function() {
      self.webRTCService.myEasyrtcid = function() {
        return 'local';
      };
      self.conference.getAttendees = function() {
        return [
          { easyrtcid: 'local', displayName: 'localName' },
          { easyrtcid: 'remote1', displayName: 'remote1Name' },
          { easyrtcid: 'remote2', displayName: 'remote2Name' }
        ];
      };
      self.devMode.enable();
      self.$interval.flush(1000);
      expect(self.devMode.peerCount).to.equal(2);
      self.conference.getAttendees = function() {
        return [
          { easyrtcid: 'local', displayName: 'localName' }
        ];
      };
      self.$interval.flush(1000);
      expect(self.devMode.peerCount).to.equal(0);
    });
  });
});
