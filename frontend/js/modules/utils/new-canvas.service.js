(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .factory('newCanvas', newCanvas);

  function newCanvas() {
    return function(width, height) {
      var canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      return canvas;
    };
  }
})(angular);
