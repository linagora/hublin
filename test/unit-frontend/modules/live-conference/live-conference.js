'use strict';

/* global chai: false */
var expect = chai.expect;

describe('The op.live-conference module', function() {

  beforeEach(function() {
    module('op.live-conference');
    module('meetings.jade.templates');
  });

  describe('The liveConference directive', function() {
    var $timeout;

    beforeEach(function() {
      var easyRTCService = this.easyRTCService = {
        _disconnectCallbacks: [],

        connect: function(conf, cb) { cb(null); },
        leaveRoom: function(conf) {},
        performCall: function(id) {},
        addDisconnectCallback: function(cb) { this._disconnectCallbacks.push(cb); }
      };

      angular.mock.module(function($provide) {
        $provide.value('easyRTCService', easyRTCService);
        $provide.constant('MAX_RECONNECT_TIMEOUT', 6000);
      });
    });

    beforeEach(inject(function($rootScope, $controller, $window, _$timeout_, $compile) {
      $window.easyrtc = {
        enableDataChannels: function() {},
        setDisconnectListener: function() {},
        setDataChannelCloseListener: function() {},
        setCallCancelled: function() {},
        setOnStreamClosed: function() {}
      };
      this.scope = $rootScope.$new();
      $timeout = _$timeout_;

      $compile('<div live-conference></div>')(this.scope);
      $rootScope.$digest();
    }));

    it('should show invitation modal on localMediaReadyEvent if no user is online', function(done) {
      this.scope.showInvitation = done;
      this.scope.conferenceState = {
        conference: {
          members: [
            {status: 'offline'}
          ]
        }
      };
      this.scope.$emit('localMediaReady');
    });

    it('should not show invitation modal on localMediaReadyEvent if some user is online', function(done) {
      this.scope.showInvitation = function() {
        done(new Error('Should not have been called'));
      };
      this.scope.conferenceState = {
        conference: {
          members: [
            {status: 'online'}
          ]
        }
      };
      this.scope.$emit('localMediaReady');
      done();
    });

    it('should attempt to reconnect after being disconnected', function() {
      this.easyRTCService.connect = function(conf, callback) {
        connected++;
        callback(cberror);
      };

      var connected = 0;
      var cberror = new Error('still putting on makeup');

      expect(this.easyRTCService._disconnectCallbacks.length).to.equal(1);
      var disconnectCallback = this.easyRTCService._disconnectCallbacks[0];

      // Trigger disconnection
      disconnectCallback();

      // Do a few reconnection attempts
      $timeout.flush(1000);
      expect(connected).to.equal(1);
      $timeout.flush(2000);
      expect(connected).to.equal(2);
      $timeout.flush(4000);
      expect(connected).to.equal(3);

      // Max timeout reached, should limit the timeout value
      $timeout.flush(6000);
      expect(connected).to.equal(4);

      // Now succeed and verify there are no remaining timers
      cberror = null;
      $timeout.flush(6000);
      expect(connected).to.equal(5);
      $timeout.verifyNoPendingTasks();
    });
  });

  describe('The disconnect-dialog directive', function() {

    var $window;
    var element, scope;

    beforeEach(inject(function($compile, $rootScope, _$window_) {
      $window = _$window_;
      scope = $rootScope.$new();
      element = $compile('<disconnect-dialog />')(scope);

      $rootScope.$digest();
    }));

    it('should reload the page when the button is clicked', function(done) {
      $window.location.reload = done;

      element.find('button').click();
    });

  });

});
