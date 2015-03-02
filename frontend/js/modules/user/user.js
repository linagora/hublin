'use strict';

angular.module('meetings.user', ['meetings.session', 'meetings.conference', 'meetings.configuration'])
  .factory('userService', ['$log', '$q', 'session', 'conferenceAPI', function($log, $q, session, conferenceAPI) {

    function getDisplayName() {
      return 'No Name';
    }

    function configure(configuration) {
      $log.debug('Configuring displayname', configuration);
      return conferenceAPI.updateMemberField(session.conference._id, session.user._id, 'displayName', configuration.displayName);
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
