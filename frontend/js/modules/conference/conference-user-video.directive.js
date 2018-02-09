(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .directive('conferenceUserVideo', conferenceUserVideo);

  function conferenceUserVideo($modal, currentConferenceState, matchmedia, LOCAL_VIDEO_ID) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/modules/conference/conference-user-video.html',
      link: link
    };

    function link(scope) {
      var modal = $modal({
        scope: scope,
        animation: 'am-fade-and-scale',
        placement: 'center',
        template: '/views/modules/conference/conference-mobile-user-video-quadrant-control.html',
        container: 'div.user-video',
        backdrop: 'static',
        show: false
      });

      scope.onMobileToggleControls = function() {
        if (matchmedia.isDesktop()) {
          return;
        }
        if (currentConferenceState.localVideoId === LOCAL_VIDEO_ID) {
          return;
        }
        modal.$promise.then(modal.toggle);
      };

      var mainVideo = {};
      var videoElement = {};
      var watcher;

      scope.$on('localVideoId:ready', function(event, videoId) {
        if (watcher instanceof Function) {
          // we must unregister previous watcher
          // if it has been initialized first
          watcher();
        }
        mainVideo = currentConferenceState.getVideoElementById(videoId);
        videoElement = mainVideo[0];
        scope.muted = videoElement.muted;

        scope.mute = function() {
          videoElement.muted = !videoElement.muted;
          scope.onMobileToggleControls();
          var attendee = currentConferenceState.getAttendeeByVideoId(videoId);

          if (!attendee) {
            return;
          }
          attendee.mute = !attendee.mute;
        };

        scope.showReportPopup = function() {
          scope.onMobileToggleControls();
          var attendee = currentConferenceState.getAttendeeByVideoId(videoId);

          if (!attendee) {
            return;
          }
          scope.showReport(attendee);
        };

        scope.isMe = videoId === LOCAL_VIDEO_ID;

        watcher = scope.$watch(function() {
          return videoElement.muted;
        }, function() {
          scope.muted = videoElement.muted;
        });
      });
    }
  }
})(angular);
