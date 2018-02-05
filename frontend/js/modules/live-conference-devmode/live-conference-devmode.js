'use strict';

angular.module('op.live-conference-devmode', ['op.live-conference'])
  .constant('devmodeMsgType', {
    sendData: 'devmode:sendData',
    sendDataP2P: 'devmode:sendDataP2P',
    sendDataWS: 'devmode:sendDataWS'
  })
  .factory('devMode', ['$log', 'currentConferenceState', 'webRTCService', '$interval', 'devmodeMsgType', 'notificationFactory',
    function($log, conference, webRTCService, $interval, devmodeMsgType, notificationFactory) {
      var devAttendees = [],
        intervalId = null;

      var service = {
        enable: enable,
        disable: disable,
        attendees: devAttendees,
        peerCount: 0,
        sendTestMessage: sendTestMessage,
        setDevModePeerListeners: setDevModePeerListeners
      };

      function refreshAttendeeConnectionStatus() {
        service.peerCount = 0;
        conference.getAttendees().forEach(function(attendee, index) {
          devAttendees[index] = devAttendees[index] || {};
          if (attendee && attendee.easyrtcid && attendee.easyrtcid !== webRTCService.myEasyrtcid()) {
            devAttendees[index].easyrtcid = attendee.easyrtcid;
            devAttendees[index].displayName = attendee.displayName;
            devAttendees[index].connectionStatusMessage = webRTCService.getP2PConnectionStatus(attendee.easyrtcid);
            devAttendees[index].connectionStatus = devAttendees[index].connectionStatusMessage === webRTCService.IS_CONNECTED;
            devAttendees[index].dataChannelStatus = webRTCService.doesDataChannelWork(attendee.easyrtcid);
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

      function sendTestMessage(msgType, easyrtcid) {
        webRTCService[msgType](easyrtcid, devmodeMsgType[msgType], { msg: 'Data sent using message type ' + msgType, from: webRTCService.myEasyrtcid() },
          function(ackmessage) {
            $log.debug('ACK received for ' + msgType, JSON.stringify(ackmessage));
            notificationFactory.weakInfo('ACK received for ' + msgType);
          }
        );
      }

      function setDevModePeerListeners(handler) {
        for (var key in devmodeMsgType) {  // eslint-disable-line
          webRTCService.setPeerListener(handler, devmodeMsgType[key]);
        }
      }

      return service;
    }
  ])
  .directive('devmodeLauncher', ['$log', 'devMode', 'notificationFactory', function($log, devMode, notificationFactory) {
    return {
      restrict: 'E',
      template: '',
      link: function(scope, element) {
        function onClick() {
          devMode.enable();
          var modalElt = $('devmode-dialog');

          var peerListener = function(easyrtcid, msgType, msgData) {
            notificationFactory.weakInfo('Message received from ' + easyrtcid);
            $log.debug(msgType, 'Message received from ' + easyrtcid, JSON.parse(msgData).msg);
          };

          devMode.setDevModePeerListeners(peerListener);

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
      link: function(scope) {
        scope.devMode = devMode;
      }
    };
  }]);
