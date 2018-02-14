(function(angular) {
  'use strict';

  angular.module('hublin.speak')
    .factory('speakEventEmitterBuilderService', speakEventEmitterBuilderService);

  function speakEventEmitterBuilderService($log, $window, speakEventEmitterService) {
    return function() {
      $window.navigator.mediaDevices && $window.navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(speakEventEmitterService.build)
        .catch(function(err) {
          $log.error('Can not get build speak detector', err);
        });
    };
  }
})(angular);
