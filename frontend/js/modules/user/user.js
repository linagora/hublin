'use strict';

angular.module('meetings.user', [
  'meetings.session',
  'meetings.conference',
  'meetings.configuration',
  'ui.router'
])

  .factory('userService', ['$log', '$q', '$stateParams', 'session', 'conferenceAPI', function($log, $q, $stateParams, session, conferenceAPI) {

    function configure(configuration) {
      $log.debug('Configuring displayname', configuration);

      return conferenceAPI.updateMemberField(session.conference._id, session.user._id, 'displayName', configuration.displayName).then(function(response) {
        session.user.displayName = configuration.displayName;

        return response;
      });
    }

    function isAnonymous() {
      return !session.user.displayName || session.user.displayName.match(/anonymous/gi) !== null;
    }

    function getDisplayName() {
      return $stateParams.displayName || (isAnonymous() ? '' : session.user.displayName);
    }

    return {
      configure: configure,
      getDisplayName: getDisplayName,
      isAnonymous: isAnonymous
    };
  }])

  .run(['configurationHandlerService', 'userService', function(configurationHandlerService, userService) {
    configurationHandlerService.register(userService.configure);
  }]);
