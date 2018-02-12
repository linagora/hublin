(function(angular) {
  'use strict';

  angular.module('meetings.speak')
    .directive('localSpeakEmitter', localSpeakEmitter);

  function localSpeakEmitter($rootScope, session, currentConferenceState, webRTCService, speakEventEmitterService) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope) {
      var unreg = $rootScope.$on('localMediaStream', function(event, stream) {
        unreg();
        createLocalEmitter(stream);
      });

      function createLocalEmitter(stream) {
        var speakEventEmitter = speakEventEmitterService(stream);

        speakEventEmitter.on('speaking', function() {
          currentConferenceState.updateSpeaking(webRTCService.myRtcid(), true);
          webRTCService.broadcastMe();
        });

        speakEventEmitter.on('stopped_speaking', function() {
          currentConferenceState.updateSpeaking(webRTCService.myRtcid(), false);
          webRTCService.broadcastMe();
        });

        scope.$on('$destroy', function() {
          speakEventEmitter.stop();
          speakEventEmitter = null;
        });
      }
    }
  }
})(angular);
