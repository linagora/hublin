'use strict';

angular.module('meetings.user', ['meetings.session'])
  .factory('userService', ['session', function(session) {

    function getDisplayName() {
      return 'No Name';
    }

    function setDisplayName(value) {
      session.setUserName(value);
    }

    return {
      getDisplayName: getDisplayName,
      setDisplayName: setDisplayName
    };
  }]);
