(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .directive('conferenceAttendeeVideo', conferenceAttendeeVideo);

  function conferenceAttendeeVideo(webRTCService, currentConferenceState, matchmedia, $timeout, drawVideo, LOCAL_VIDEO_ID) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/modules/conference/conference-attendee-video.html',
      scope: {
        attendee: '=*',
        videoId: '@',
        onVideoClick: '=',
        videoIndex: '=',
        showReport: '='
      },
      link: link
    };

    function link(scope) {
      scope.showReportPopup = function() {
        scope.showReport(scope.attendee);
      };

      scope.toggleAttendeeMute = function() {
        var mute = scope.attendee.localmute;

        webRTCService.muteRemoteMicrophone(scope.attendee.rtcid, !mute);
        currentConferenceState.updateLocalMuteFromRtcid(scope.attendee.rtcid, !mute);
      };

      scope.isDesktop = matchmedia.isDesktop();
      scope.isMe = scope.videoId === LOCAL_VIDEO_ID;
    }
  }
})(angular);
