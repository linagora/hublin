(function(angular) {
  'use strict';

  angular.module('meetings.conference')
    .factory('conferenceUserMediaInterceptorService', conferenceUserMediaInterceptorService);

  function conferenceUserMediaInterceptorService($q, $rootScope, $window) {
    return function() {
      var getUserMedia = $window.navigator.getUserMedia;
      var getUserMediaFromMediaDevices = navigator.mediaDevices.getUserMedia;

      $window.navigator.mediaDevices.getUserMedia = function(constraints) {
        var defer = $q.defer();

        getUserMediaFromMediaDevices(constraints).then(resolveStream, function() {
          // on error, try to get the stream again, this time without constraints
          getUserMediaFromMediaDevices({ audio: true, video: true }).then(resolveStream, function(err) {
            defer.reject(err);
          });
        });

        function resolveStream(stream) {
          $rootScope.$emit('localMediaStream', stream);
          defer.resolve(stream);
        }

        return defer.promise;
      };

      $window.navigator.getUserMedia = function(constraints, successCallback, errorCallback) {
        getUserMedia(constraints, interceptStream(successCallback), function() {
          getUserMedia({ audio: true, video: true }, interceptStream(successCallback), errorCallback);
        });
      };

      function interceptStream(callback) {
        return function(mediaStream) {
          $rootScope.$emit('localMediaStream', mediaStream);

          callback(mediaStream);
        };
      }
    };
  }
})(angular);
