(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .directive('scaleToCanvas', scaleToCanvas);

  function scaleToCanvas($interval, $window, cropDimensions, drawAvatarIfVideoMuted, drawHelper, currentConferenceState) {
    var requestAnimationFrame =
      $window.requestAnimationFrame ||
      $window.mozRequestAnimationFrame ||
      $window.msRequestAnimationFrame ||
      $window.webkitRequestAnimationFrame;

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      var widgets = [];
      var toggleAnim = false;
      var stopScaling = false;

      $interval(function cacheWidgets() {
        currentConferenceState.videoElements.forEach(function(vid) {
          var canvas = element.find('canvas[data-video-id=' + vid[0].id + ']').get(0);

          widgets.push({
            video: vid[0],
            canvas: canvas,
            context: canvas.getContext('2d')
          });
        });
      }, 250, 1, false);

      onAnimationFrame();

      function videoToCanvas(widget) {
        var canvas = widget.canvas,
            ctx = widget.context,
            vid = widget.video,
            width = canvas.width,
            height = canvas.height,
            vHeight = vid.videoHeight,
            vWidth = vid.videoWidth;

        if (!height || !width) {
          return;
        }

        drawAvatarIfVideoMuted(vid.id, ctx, width, height, function() {
          var cropDims = cropDimensions(width, height, vWidth, vHeight);

          drawHelper.drawImage(ctx, vid, cropDims[0], cropDims[1], cropDims[2], cropDims[2], 0, 0, width, height);
        });
      }

      function onAnimationFrame() {
        /* eslint no-cond-assign: "warn" */
        if ((toggleAnim = !toggleAnim)) {
          widgets.forEach(videoToCanvas);
        }
        if (stopScaling) {
          return;
        }
        requestAnimationFrame(onAnimationFrame);
      }

      function garbage() {
        stopScaling = true;
        widgets = [];
      }

      scope.$on('$destroy', garbage);
    }
  }
})(angular);
