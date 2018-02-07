(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .directive('smartFit', smartFit);

  function smartFit($rootScope) {
    return {
      restrict: 'A',
      replace: true,
      link: link
    };

    function link(scope, element, attrs) {
      var unregisterRootScopeListener,
          source = angular.element(attrs.from),
          toPreserve = angular.element(attrs.preserve);

      function smartFit() {
        var canvas = element.find('canvas')[0];

        if (!canvas) {
          return;
        }
        var availWidth = source.width(),
          availHeight = source.height(),
          width = canvas.width,
          height = canvas.height,
          videoAspectRatio = width / height,
          containerAspectRatio = availWidth / availHeight;

        function fitWidth() {
          width = availWidth;
          height = Math.floor(width / videoAspectRatio);
        }

        function fitHeight() {
          height = availHeight;
          width = Math.floor(height * videoAspectRatio);
        }

        if (videoAspectRatio > containerAspectRatio) {
          fitWidth();
        } else {
          fitHeight();
        }

        element.css({
          height: height + 'px',
          width: width + 'px'
        });

        if (toPreserve.length) {
          element.css(
            'margin-top',
            Math.max(0, (toPreserve.position().top - height) / 2) + 'px'
          );
        }
      }

      source.resize(smartFit);
      unregisterRootScopeListener = $rootScope.$on('localVideoId:ready', smartFit);

      scope.$on('$destroy', function() {
        source.off('resize', smartFit);
        unregisterRootScopeListener();
      });
    }
  }
})(angular);
