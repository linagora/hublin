(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .factory('attendeeColorsService', attendeeColorsService);

  function attendeeColorsService(MAX_ATTENDEES) {
    var colors = [
      '#EF5350',
      '#5C6BC0',
      '#26A69A',
      '#FFEE58',
      '#FF7043',
      '#00B0FF',
      '#9CCC65',
      '#BDBDBD',
      '#FFA726'
    ];

    return {
      getColorForAttendeeAtIndex: getColorForAttendeeAtIndex
    };

    function getColorForAttendeeAtIndex(index) {
      return colors[index % MAX_ATTENDEES];
    }
  }
})(angular);
