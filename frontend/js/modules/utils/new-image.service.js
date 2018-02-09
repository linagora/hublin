(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .factory('newImage', newImage);

  function newImage() {
    return function() {
      return new Image();
    };
  }
})(angular);
