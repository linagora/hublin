'use strict';

describe('The meetings.invitation module', function() {

  beforeEach(function() {
    module('op.live-conference');
    module('meetings.invitation');
    module('meetings.jade.templates');
  });

  describe('The invitationDialogLauncher directive', function() {
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

    beforeEach(inject(function($rootScope, $window, _$timeout_, $compile) {
      $window.easyrtc = {
        enableDataChannels: function() {},
        setDisconnectListener: function() {},
        setDataChannelCloseListener: function() {},
        setCallCancelled: function() {},
        setOnStreamClosed: function() {}
      };
      this.scope = $rootScope.$new();
      $timeout = _$timeout_;

      $compile('<div live-conference invitation-dialog-launcher></div>')(this.scope);
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
  });
});
