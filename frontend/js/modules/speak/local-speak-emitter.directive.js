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
          webRTCService.myRtcid().then(function(rtcId) {
            currentConferenceState.updateSpeaking(rtcId, true);
            webRTCService.broadcastMe();
          });
        });

        speakEventEmitter.on('stopped_speaking', function() {
          webRTCService.myRtcid().then(function(rtcId) {
            currentConferenceState.updateSpeaking(rtcId, false);
            webRTCService.broadcastMe();
          });
        });
      }, function(err) {
        $log.debug('Can not get speak events', err);
      });
    }
  }
})(angular);
