'use strict';

angular.module('op.live-conference', [
  'op.liveconference-templates',
  'op.easyrtc',
  'op.websocket',
  'op.notification',
  'meetings.authentication',
  'meetings.session',
  'meetings.conference',
  'meetings.invitation',
  'meetings.report',
  'meetings.wizard'
]).controller('conferenceController', [
  '$scope',
  '$log',
  'session',
  'conference',
  'ioConnectionManager',
  function($scope, $log, session, conference, ioConnectionManager) {
    session.ready.then(function() {
      var wsServerURI = '';

      if (conference.configuration && conference.configuration.hosts && conference.configuration.hosts.length) {
        conference.configuration.hosts.forEach(function(host) {
          if ('ws' === host.type) {
            wsServerURI = host.url;
          }
        });
      }

      $scope.wsServerURI = wsServerURI;
      $log.info('Using \'%s\' as the websocket backend.', wsServerURI);

      $log.debug('Connecting to websocket at address \'%s\' for user %s.', $scope.wsServerURI, session.user);
      ioConnectionManager.connect($scope.wsServerURI);
    });

    $scope.conference = conference;
    $scope.process = {
      step: 'configuration'
    };

    $scope.init = function() {
      session.initialized.then(function() {
        $scope.process.step = 'conference';
      });

      session.goodbye.then(function() {
        $scope.process.step = 'goodbye';
      });
    };

    $scope.init();
  }
]).controller('liveConferenceController', [
  '$scope',
  '$log',
  '$timeout',
  '$interval',
  'session',
  'conferenceAPI',
  'easyRTCService',
  'conferenceHelpers',
  'ConferenceState',
  function($scope, $log, $timeout, $interval, session, conferenceAPI, easyRTCService, conferenceHelpers, ConferenceState) {
    $scope.conference = session.conference;
    $scope.conferenceState = new ConferenceState($scope.conference);
    $scope.users = [];
    $scope.attendees = [];
    $scope.reportedAttendee = null;
    $scope.mainVideoId = 'video-thumb0';
    $scope.attendeeVideoIds = $scope.conferenceState.videoIds;

    $scope.$on('$locationChangeStart', function() {
      easyRTCService.leaveRoom($scope.conference);
    });

    $scope.getMainVideoAttendeeIndex = function(mainVideoId) {
      return conferenceHelpers.getMainVideoAttendeeIndexFrom(mainVideoId);
    };

    $scope.streamToMainCanvas = function(index) {
      var mainVideoId = $scope.attendeeVideoIds[index];
      $scope.mainVideoId = mainVideoId;
      $scope.conferenceState.updateMainVideoId(mainVideoId);
    };

    $scope.showInvitation = function() {
      $('#invite').modal('show');
    };

    $scope.showReport = function(attendee) {
      $scope.reportedAttendee = attendee;
      $('#reportModal').modal('show');
    };

    $scope.onLeave = function() {
      $log.debug('Leaving the conference');
      easyRTCService.leaveRoom($scope.conference);
      session.leave();
    };

    $scope.isMainVideo = function(videoId) {
      return conferenceHelpers.isMainVideo($scope.mainVideoId, videoId);
    };

    $scope.performCall = function(otherEasyrtcid) {
      easyRTCService.performCall(otherEasyrtcid);
    };

    $scope.invite = function(user) {
      $log.debug('Invite user', user);
      conferenceAPI.invite($scope.conference._id, user._id).then(
        function(response) {
          $log.info('User has been invited', response.data);
        },
        function(error) {
          $log.error('Error while inviting user', error.data);
        }
      );
    };

    conferenceAPI.getMembers($scope.conference._id).then(
      function(response) {
        $scope.users = response.data;
        conferenceHelpers.mapUserIdToName($scope.users);
      },
      function(error) {
        $log.error('Can not get members ' + error);
      }
    );

    // We must wait for the directive holding the template containing videoIds
    // to be displayed in the browser before using easyRTC.
    var unregister = $scope.$watch(function() {
      return angular.element('#video-thumb0')[0];
    }, function(video) {
      if (video) {
        easyRTCService.connect($scope.conference, $scope.mainVideoId, $scope.attendees, $scope.conferenceState);
        unregister();
      }
    });

    function _updateConferenceScope(conference) {
      $log.debug('Update conference to', conference);
      $scope.conference = conference;
      $scope.users = conference.members;
      conferenceHelpers.mapUserIdToName($scope.users);
      $scope.conferenceState.updatePositions($scope.conference);
    }

    $scope.$on('conferencestate:attendees:push', function() {
      conferenceAPI.get($scope.conference._id).then(function(response) {
        _updateConferenceScope(response.data);

        if ($scope.conferenceState.attendees.length === 2) {
          var video = $('#video-thumb1');
          var interval = $interval(function() {
            if (video[0].videoWidth) {
              $scope.streamToMainCanvas(1);
              $scope.$apply();
              $interval.cancel(interval);
            }
          }, 100, 30, false);
        }
      }, function(err) {
        $log.error('Cannot get conference', $scope.conference._id, err);
      })
    });

    $scope.$on('conferencestate:attendees:remove', function(event, data) {
      conferenceAPI.get($scope.conference._id).then(function(response) {
        _updateConferenceScope(response.data);

        if (data.position && data.position.videoId === $scope.conferenceState.mainVideoId) {
          $log.debug('Stream first attendee to main canvas');
          $scope.streamToMainCanvas(0)
        }
      }, function(err) {
        $log.error('Cannot get conference', $scope.conference._id, err);
      })
    });
  }
]).directive('liveConferenceNotification', ['$log', 'session', 'notificationFactory', 'livenotification', 'conferenceHelpers',
  function($log, session, notificationFactory, livenotification, conferenceHelpers) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        function liveNotificationHandler(msg) {
          $log.debug('Got a live notification', msg);
          if (msg.user._id !== session.user._id) {
            conferenceHelpers.mapUserIdToName(msg.user);
            notificationFactory.weakInfo('Conference updated!', msg.message);
          }
        }

        var socketIORoom = livenotification('/conferences', attrs.conferenceId)
          .on('notification', liveNotificationHandler);

        scope.$on('$destroy', function() {
          socketIORoom.removeListener('notification', liveNotificationHandler);
        });
      }
    };
  }]);
