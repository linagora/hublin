(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .directive('conferenceMobileVideo', conferenceMobileVideo);

  function conferenceMobileVideo($timeout, $window, $rootScope, drawVideo, currentConferenceState) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/modules/conference/conference-mobile-video.html',
      link: link
    };

    function link(scope, element) {
      var mainVideo;
      var canvas, context;
      var stopAnimation = function() {};

      canvas = element[0];
      function garbage() {
        stopAnimation();
        canvas = {};
        context = {};
        mainVideo = {};
        stopAnimation = function() {};
      }

      function drawMobileVideo() {
        stopAnimation = drawVideo(context, mainVideo[0], canvas.width, canvas.height);
      }

      $timeout(function() {
        context = canvas.getContext('2d');
        mainVideo = currentConferenceState.getVideoElementById(currentConferenceState.localVideoId);
        $timeout(drawMobileVideo);
      }, 500);

      scope.$on('conferencestate:localVideoId:update', function(event, newVideoId) {
        if (!mainVideo[0]) {
          return;
        }
        mainVideo = currentConferenceState.getVideoElementById(newVideoId);
        $timeout(drawMobileVideo);
      });

      scope.$on('$destroy', garbage);
    }
  }
})(angular);
