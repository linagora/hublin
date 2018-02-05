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

    function weakInfo(title, text) {
      show(title, text);
    }

    function weakSuccess(title, text) {
      show(title, text);
    }

    function weakError(title, text) {
      show(title, text);
    }

    function strongInfo(title, text) {
      show(title, text, topright, 0);
    }

    function show(title, text, position, delay) {
      $mdToast.show($mdToast.simple()
        .textContent(title + ' - ' + text)
        .position(position || bottomright)
        .hideDelay(delay || defaultDelay)
      );
    }
  }
})(angular);
