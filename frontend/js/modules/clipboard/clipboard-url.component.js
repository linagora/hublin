(function(angular) {
  'use strict';

  angular.module('meetings.clipboard')
    .component('clipboardUrl', {
      bindings: {
        url: '<'
      },
      templateUrl: '/views/modules/clipboard/clipboard-url.html',
      controller: 'clipboardUrlController',
      controllerAs: 'ctrl'
    });
})(angular);
