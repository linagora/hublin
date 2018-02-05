(function(angular) {
  'use strict';

  angular.module('op.notification')
    .factory('notificationFactory', notificationFactory);

  function notificationFactory($mdToast) {
    var bottomright = 'bottom right';
    var topright = 'top right';
    var defaultDelay = 3000;

    return {
      strongInfo: strongInfo,
      weakInfo: weakInfo,
      weakError: weakError,
      weakSuccess: weakSuccess
    };

    function weakInfo(text) {
      show(text);
    }

    function weakSuccess(text) {
      show(text);
    }

    function weakError(text) {
      show(text);
    }

    function strongInfo(text) {
      show(text, topright, 0);
    }

    function show(text, position, delay) {
      $mdToast.show($mdToast.simple()
        .textContent(text)
        .position(position || bottomright)
        .hideDelay(delay || defaultDelay)
      );
    }
  }
})(angular);
