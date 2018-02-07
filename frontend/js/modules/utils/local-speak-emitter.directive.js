(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .directive('localSpeakEmitter', localSpeakEmitter);

  function localSpeakEmitter($rootScope, session, currentConferenceState, webRTCService, speechDetector) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope) {
      function createLocalEmitter(stream) {
        var detector = speechDetector(stream);
        scope.$on('$destroy', function() {
          detector.stop();
          detector = null;
        });
        detector.on('speaking', function() {
          currentConferenceState.updateSpeaking(webRTCService.myRtcid(), true);
          webRTCService.broadcastMe();
        });
        detector.on('stopped_speaking', function() {
          currentConferenceState.updateSpeaking(webRTCService.myRtcid(), false);
          webRTCService.broadcastMe();
        });
      }

      var unreg = $rootScope.$on('localMediaStream', function(event, stream) {
        unreg();
        createLocalEmitter(stream);
      });
    }
  }
})(angular);
