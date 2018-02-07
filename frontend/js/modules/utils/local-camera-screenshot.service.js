(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .factory('localCameraScreenshot', localCameraScreenshot);

  function localCameraScreenshot(LOCAL_VIDEO_ID, DEFAULT_AVATAR_SIZE, currentConferenceState, newCanvas, newImage) {
    return {
      shoot: shoot
    };

    function shoot(screenshotEdgePx) {
      var attendee = currentConferenceState.getAttendeeByVideoId(LOCAL_VIDEO_ID);

      if (!attendee || attendee.muteVideo) {
        return null;
      }

      var size = screenshotEdgePx || DEFAULT_AVATAR_SIZE,
          thumbnail = angular.element('canvas[data-video-id=' + LOCAL_VIDEO_ID + ']');

      if (!thumbnail.length) {
        return null;
      }

      var canvas = newCanvas(size, size),
          image = newImage();

      canvas.getContext('2d').drawImage(thumbnail[0], 0, 0, size, size);
      image.src = canvas.toDataURL();

      return image;
    }
  }
})(angular);
