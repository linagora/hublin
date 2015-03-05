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

    function isAnonymous() {
      return !session.user.displayName || session.user.displayName.match(/anonymous/gi) !== null;
    }

    return {
      getDisplayName: getDisplayName,
      configure: configure,
      isAnonymous: isAnonymous
    };
  }])
  .run(['configurationHandlerService', 'userService', function(configurationHandlerService, userService) {
    configurationHandlerService.register(userService.configure);
  }]);
