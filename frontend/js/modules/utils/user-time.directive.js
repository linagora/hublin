(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .directive('userTime', userTime);

  function userTime(attendeeColorsService, $interval, currentConferenceState, LOCAL_VIDEO_ID, moment) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope) {
      var removeIntervalLoop = $interval(formatRemoteTime, 60000);

      scope.$on('conferencestate:localVideoId:update', onVideoUpdate);
      scope.$on('$destroy', function() {
        $interval.cancel(removeIntervalLoop);
      });

      function formatRemoteTime() {
        var DEFAULT_COLOR = 'black';
        var attendee = currentConferenceState.getAttendeeByVideoId(currentConferenceState.localVideoId);

        if (attendee) {
          var color = attendeeColorsService.getColorForAttendeeAtIndex(attendee.index);

          scope.color = attendee.muteVideo ? color : DEFAULT_COLOR;
        }

        if (angular.isDefined(scope.timezoneOffsetDiff)) {
          scope.remoteHour = moment().add(scope.timezoneOffsetDiff, 'm').format('hh:mm a');
        } else {
          scope.remoteHour = null;
        }
      }

      function onVideoUpdate() {
        var localTimezoneOffset = currentConferenceState.getAttendeeByVideoId(LOCAL_VIDEO_ID).timezoneOffset;
        var remoteTimezoneOffset = currentConferenceState.getAttendeeByVideoId(currentConferenceState.localVideoId).timezoneOffset;

        if (angular.isDefined(localTimezoneOffset) &&
            angular.isDefined(remoteTimezoneOffset) &&
            localTimezoneOffset !== remoteTimezoneOffset) {
          scope.timezoneOffsetDiff = localTimezoneOffset - remoteTimezoneOffset;
        } else {
          scope.timezoneOffsetDiff = undefined;
        }
        formatRemoteTime();
      }
    }
  }
})(angular);
