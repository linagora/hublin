(function(angular) {
  'use strict';

  angular.module('hublin.speak')
    .directive('localSpeakWhileMuted', localSpeakWhileMuted);

  function localSpeakWhileMuted($log, $rootScope, session, currentConferenceState, speakEventEmitterService, notificationFactory, LOCAL_VIDEO_ID) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      speakEventEmitterService.get().then(function(speakEventEmitter) {
        speakEventEmitter.on('speaking', function() {
          var me = currentConferenceState.getAttendeeByVideoId(LOCAL_VIDEO_ID);

          if (me && me.mute) {
            element.addClass('unmute');
          }
        });

        speakEventEmitter.on('stopped_speaking', function() {
          element.removeClass('unmute');
        });

        scope.$on('$destroy', function() {
          speakEventEmitter.off('speaking');
          speakEventEmitter.off('stopped_speaking');
        });

      }, function(err) {
        $log.debug('Can not get speak events', err);
      });
    }
  }
})(angular);
