(function(angular) {
  'use strict';

  angular.module('hublin.speak')
    .factory('speakEventEmitterService', speakEventEmitterService);

  function speakEventEmitterService($q, hark) {
    var defer = $q.defer();
    var eventEmitter;

    return {
      get: get,
      build: build
    };

    function get() {
      return defer.promise;
    }

    function build(stream, options) {
      if (eventEmitter) {
        return get();
      }

      options = options || {};
      options.play = false;

      try {
        eventEmitter = hark(stream, options);
        stream = null;

        if (eventEmitter) {
          defer.resolve(eventEmitter);
        }
      } catch (err) {
        defer.reject(err);
      }
    }
  }
})(angular);
