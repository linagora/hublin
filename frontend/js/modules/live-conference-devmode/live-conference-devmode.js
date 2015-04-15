'use strict';

angular.module('op.live-conference-devmode', ['op.live-conference'])
.factory('devMode', ['currentConferenceState', 'easyRTCService', '$interval',
  function(conference, easyRTCService, $interval) {
    var devAttendees = [],
    intervalId = null;

    function refreshAttendeeConnectionStatus() {
      service.peerCount = 0;
      conference.getAttendees().forEach(function(attendee, index) {
        devAttendees[index] = devAttendees[index] || {};
        if (attendee && attendee.easyrtcid && attendee.easyrtcid !== easyRTCService.myEasyrtcid()) {
          devAttendees[index].easyrtcid = attendee.easyrtcid;
          devAttendees[index].displayName = attendee.displayName;
          devAttendees[index].connectionStatusMessage = easyRTCService.getP2PConnectionStatus(attendee.easyrtcid);
          devAttendees[index].connectionStatus = devAttendees[index].connectionStatusMessage === easyRTCService.IS_CONNECTED;
          devAttendees[index].dataChannelStatus = easyRTCService.doesDataChannelWork(attendee.easyrtcid);
          service.peerCount++;
        } else {
          delete devAttendees[index].easyrtcid;
        }
      });
    }

    function enable() {
      if (intervalId) {
        $interval.cancel(intervalId);
      }
      intervalId = $interval(function() {
        refreshAttendeeConnectionStatus();
      }, 1000);
    }

    function disable() {
      if (intervalId) {
        $interval.cancel(intervalId);
        intervalId = null;
      }
    }

    var service = {
      enable: enable,
      disable: disable,
      attendees: devAttendees,
      peerCount: 0
    };

    return service;
  }
])
.directive('devmodeLauncher', ['devMode', function(devMode) {
  return {
    restrict: 'E',
    template: '',
    link: function(scope, element) {
      function onClick() {
        devMode.enable();
        var modalElt = $('devmode-dialog');
        modalElt.modal('show');
        modalElt.one('hidden.bs.modal', function() {
          devMode.disable();
        });
      }
      element.on('click', onClick);
    }
  };
}])
.directive('devmodeDialog', ['devMode', function(devMode) {
  return {
    restrict: 'E',
    templateUrl: '/views/modules/live-conference-devmode/devmode-dialog.html',
    link: function(scope, element) {
      scope.devMode = devMode;
    }
  };
}]);
