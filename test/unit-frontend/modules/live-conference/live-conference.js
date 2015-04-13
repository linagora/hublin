'use strict';

describe('The op.live-conference module', function() {

  beforeEach(function() {
    module('op.live-conference');
    module('meetings.jade.templates');
  });

  describe('The liveConferenceController', function() {

    beforeEach(inject(function($rootScope, $controller, $window) {
      $window.easyrtc = {
        enableDataChannels: function() {},
        setDisconnectListener: function() {}
      };

      this.scope = $rootScope.$new();

      $controller('liveConferenceController', {
        $scope: this.scope
      });
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
