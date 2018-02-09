(function(angular) {
  'use strict';

  angular.module('op.live-conference').directive('conferenceAttendee', conferenceAttendee);

  function conferenceAttendee() {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/conference/conference-attendee.html'
    };
  }
})(angular);
