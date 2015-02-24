'use strict';

angular.module('meetings.user', [])
  .factory('userService', function() {

    function getDisplayName() {
      return 'No Name';
    }

    function setDisplayName(value) {
    }

    return {
      getDisplayName: getDisplayName,
      setDisplayName: setDisplayName
    };
  });
