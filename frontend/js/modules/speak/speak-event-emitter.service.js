(function(angular) {
  'use strict';

  angular.module('meetings.speak')
    .factory('speakEventEmitterService', speakEventEmitterService);

  function speakEventEmitterService(hark) {
    return function(stream, options) {
      var opts = options || {};

      opts.play = false;
      var eventEmitter = hark(stream, opts);

      stream = null;

      return eventEmitter;
    };
  }
})(angular);
