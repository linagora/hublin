'use strict';

/* global chai */
var expect = chai.expect;

describe('The op.live-conference-devmode module', function() {

  beforeEach(function() {
    angular.mock.module('op.live-conference-devmode');
  });

  describe('devMode service', function() {

    beforeEach(function() {
      this.conference = {
        getAttendees: function() { return []; }
      };
      this.easyRTCService = {
        myEasyrtcid: function() {},
        getP2PConnectionStatus: function() {},
        doesDataChannelWork: function() { return true; }
      };
    });

    describe('enable() method', function() {
      it('should register a callback in $interval', function(done) {
        var self = this;
        var $interval = function(callback, ms) {
          expect(callback).to.be.a('function');
          expect(ms).to.be.a.number;
          expect(ms).to.equal(1000);
          done();
        };
        module(function($provide) {
          $provide.value('currentConferenceState', self.conference);
          $provide.value('easyRTCService', self.easyRTCService);
          $provide.value('$interval', $interval);
        });
        inject(function(devMode) {
          devMode.enable();
        });
      });
    });

    describe('setDevModePeerListeners', function() {
      it('should call setPeerListener for all devmodeMsgType values', function(done) {
        var self = this;
        var handler = 'aHandler';
        var count = 0;
        this.easyRTCService.setPeerListener = function(listener, msgType) {
          expect(listener).to.deep.equal(handler);
          count++;
          if (count === 1) {
            expect(msgType).to.equal('devmode:sendData');
          }
          else if (count === 2) {
            expect(msgType).to.equal('devmode:sendDataP2P');
          }
          else if (count === 3) {
            expect(msgType).to.equal('devmode:sendDataWS');
            done();
          }
        };
        module(function($provide) {
          $provide.value('currentConferenceState', self.conference);
          $provide.value('easyRTCService', self.easyRTCService);
        });
        inject(function(devMode) {
          devMode.setDevModePeerListeners(handler);
        });
      });
    });
  });
  describe('disable() method', function() {
    it('should unregister $interval\'s callback', function(done) {
      var self = this;
      var $interval = function(callback, ms) {
        return 'token1';
      };
      $interval.cancel = function(token) {
        expect(token).to.equal('token1');
        done();
      };
      module(function($provide) {
        $provide.value('currentConferenceState', self.conference);
        $provide.value('easyRTCService', self.easyRTCService);
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
      var self = this;
      module(function($provide) {
        $provide.value('currentConferenceState', self.conference);
        $provide.value('easyRTCService', self.easyRTCService);
      });
      inject(function($interval, devMode) {
        self.$interval = $interval;
        self.devMode = devMode;
      });
    });
    it('should expose an attendees array', function() {
      this.easyRTCService.myEasyrtcid = function() {
        return 'local';
      };
      this.conference.getAttendees = function() {
        return [
          {easyrtcid: 'local', displayName: 'localName'},
          {easyrtcid: 'remote1', displayName: 'remote1Name'},
          {easyrtcid: 'remote2', displayName: 'remote2Name'}
        ];
      };
      this.devMode.enable();
      this.$interval.flush(1000);
      expect(this.devMode.attendees).to.deep.equal([
          {},
          {easyrtcid: 'remote1', displayName: 'remote1Name', connectionStatusMessage: undefined, connectionStatus: true, dataChannelStatus: true},
          {easyrtcid: 'remote2', displayName: 'remote2Name', connectionStatusMessage: undefined, connectionStatus: true, dataChannelStatus: true}
      ]);
    });
    it('should expose the number of peers', function() {
      this.easyRTCService.myEasyrtcid = function() {
        return 'local';
      };
      this.conference.getAttendees = function() {
        return [
          {easyrtcid: 'local', displayName: 'localName'},
          {easyrtcid: 'remote1', displayName: 'remote1Name'},
          {easyrtcid: 'remote2', displayName: 'remote2Name'}
        ];
      };
      this.devMode.enable();
      this.$interval.flush(1000);
      expect(this.devMode.peerCount).to.equal(2);
      this.conference.getAttendees = function() {
        return [
          {easyrtcid: 'local', displayName: 'localName'}
        ];
      };
      this.$interval.flush(1000);
      expect(this.devMode.peerCount).to.equal(0);
    });
  });
});
