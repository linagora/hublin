(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .directive('conferenceVideo', conferenceVideo);

  function conferenceVideo($timeout, $window, $rootScope, drawVideo, currentConferenceState, LOCAL_VIDEO_ID, DEFAULT_AVATAR_SIZE, $state) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/modules/conference/conference-video.html',
      link: link
    };

    function link(scope, element) {
      var canvas = {};
      var context = {};
      var mainVideo = {};
      var currentVideoId = LOCAL_VIDEO_ID;
      var stopAnimation = function() {};

      function garbage() {
        stopAnimation();
        canvas = {};
        context = {};
        mainVideo = {};
        stopAnimation = function() {};
      }

      function drawVideoInCanvas() {
        canvas[0].width = mainVideo[0].videoWidth || DEFAULT_AVATAR_SIZE;
        canvas[0].height = mainVideo[0].videoHeight || DEFAULT_AVATAR_SIZE;
        stopAnimation = drawVideo(context, mainVideo[0], canvas[0].width, canvas[0].height);

        $rootScope.$broadcast('localVideoId:ready', mainVideo[0].id);
      }

      $timeout(function() {
        canvas = element.find('canvas#mainVideoCanvas');
        context = canvas[0].getContext('2d');
        mainVideo = currentConferenceState.getVideoElementById(LOCAL_VIDEO_ID);
        if ($state.current.data.hasVideo) {
          drawVideoInCanvas();
        } else {
          mainVideo.on('loadedmetadata', function() {
            $state.current.data.hasVideo = true;
            if ($window.mozRequestAnimationFrame) {
              // see https://bugzilla.mozilla.org/show_bug.cgi?id=926753
              // Firefox needs this timeout.
              $timeout(function() {
                drawVideoInCanvas();
              }, 500);
            } else {
              drawVideoInCanvas();
            }
          });}
      }, 1000);

      scope.conferenceState = currentConferenceState;
      scope.$on('conferencestate:localVideoId:update', function(event, newVideoId) {
        // Reject the first watch of the mainVideoId
        // when clicking on a new video, loadedmetadata event is not
        // fired.
        if (!mainVideo[0] || newVideoId === currentVideoId) {
          return;
        }
        currentVideoId = newVideoId;
        mainVideo = currentConferenceState.getVideoElementById(newVideoId);
        drawVideoInCanvas();
      });

      scope.streamToMainCanvas = function(index) {
        return scope.conferenceState.updateLocalVideoIdToIndex(index);
      };

      scope.$on('$destroy', garbage);

      $rootScope.$on('paneSize', function(event, paneSize) {
        if (paneSize.width !== undefined) {
          scope.paneStyle = {width: (100 - paneSize.width) + '%'};
        }
        if (paneSize.height !== undefined) {
          scope.paneStyle = {width: (100 - paneSize.height) + '%'};
        }

      });

      $rootScope.$on('attendeesBarSize', function(event, paneSize) {
        if (paneSize.width !== undefined) {
          scope.attendeesBarStyle = {width: (100 - paneSize.width) + '%'};
        }
        if (paneSize.height !== undefined) {
          scope.attendeesBarStyle = {width: (100 - paneSize.height) + '%'};
        }

        if (paneSize.marginRight !== undefined) {
          scope.attendeesBarContentStyle = {'margin-right': paneSize.marginRight};
        }

      });

      angular.element($window).on('orientationchange', drawVideoInCanvas);
    }
  }
})(angular);
