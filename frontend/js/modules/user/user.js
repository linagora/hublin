'use strict';

angular.module('meetings.user', ['meetings.session', 'meetings.conference', 'meetings.configuration'])
  .factory('userService', ['$log', '$q', 'session', 'conferenceAPI', function($log, $q) {

    function getDisplayName() {
      return 'No Name';
    }

    function configure(configuration) {
      $log.debug('Configuring displayname', configuration);
      var defer = $q.defer();
      defer.resolve();
      return defer.promise;
    }

    return {
      getDisplayName: getDisplayName,
      configure: configure
    };
  }])
  .controller('usernameController', ['$scope', 'userService', function($scope, userService) {

    $scope.getDisplayName = function() {
      return userService.getDisplayName();
    };

    $scope.displayName = $scope.getDisplayName();

  }])
  .run(['configurationHandlerService', 'userService', function(configurationHandlerService, userService) {
    configurationHandlerService.register(userService.configure);
  }]);
