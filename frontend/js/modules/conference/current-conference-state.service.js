(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .factory('currentConferenceState', currentConferenceState);

  function currentConferenceState(session, ConferenceState) {
    return new ConferenceState(session.conference);
  }
})(angular);
