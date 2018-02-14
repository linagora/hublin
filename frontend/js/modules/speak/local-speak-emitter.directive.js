(function(angular) {
  'use strict';

  angular.module('hublin.speak')
    .directive('localSpeakEmitter', localSpeakEmitter);

  function localSpeakEmitter($log, $rootScope, currentConferenceState, webRTCService, speakEventEmitterService) {
    return {
      restrict: 'A',
      link: link
    };

    function link() {
      speakEventEmitterService.get().then(function(speakEventEmitter) {
        speakEventEmitter.on('speaking', function() {
          currentConferenceState.updateSpeaking(webRTCService.myRtcid(), true);
          webRTCService.broadcastMe();
        });

        speakEventEmitter.on('stopped_speaking', function() {
          currentConferenceState.updateSpeaking(webRTCService.myRtcid(), false);
          webRTCService.broadcastMe();
        });
      }, function(err) {
        $log.debug('Can not get speak events', err);
      });
    }
  }
})(angular);
