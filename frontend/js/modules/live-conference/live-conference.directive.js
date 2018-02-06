(function(angular) {
  'use strict';

  angular.module('op.live-conference').directive('liveConference', liveConference);

  function liveConference(
    $log,
    $timeout,
    $interval,
    session,
    conferenceAPI,
    webRTCService,
    currentConferenceState,
    conferenceErrorDialogsService,
    invitationDialogLauncherService,
    LOCAL_VIDEO_ID,
    REMOTE_VIDEO_IDS
  ) {
    return {
      restrict: 'A',
      controller: controller
    };

    function controller($scope) {
      $scope.conference = session.conference;
      $scope.conferenceState = currentConferenceState;
      $scope.conferenceId = $scope.conference._id;
      $scope.reportedAttendee = null;

      $scope.$on('$locationChangeStart', function() {
        webRTCService.leaveRoom($scope.conferenceState.conference);
      });

      $scope.showInvitation = function() {
        invitationDialogLauncherService.show();
      };

      $scope.showReport = function(attendee) {
        $scope.reportedAttendee = attendee;
        $('#reportModal').modal('show');
      };

      $scope.onLeave = function() {
        $log.debug('Leaving the conference');
        webRTCService.leaveRoom($scope.conferenceState.conference);
        session.leave();
      };

      $scope.invite = function(user) {
        $log.debug('Invite user', user);
        conferenceAPI.invite($scope.conferenceId, user._id).then(
          function(response) {
            $log.info('User has been invited', response.data);
          },
          function(error) {
            $log.error('Error while inviting user', error.data);
          }
        );
      };

      $scope.$on('conferencestate:attendees:push', function() {
        conferenceAPI.get($scope.conferenceId).then(function(response) {
          $scope.conferenceState.conference = response.data;
        }, function(err) {
          $log.error('Cannot get conference', $scope.conferenceId, err);
        });

        if ($scope.conferenceState.attendees.length === 2) {
          var video = $('#' + REMOTE_VIDEO_IDS[0]);
          var interval = $interval(function() {
            if (video[0].videoWidth) {
              $scope.conferenceState.updateLocalVideoIdToIndex(1);
              $scope.$apply();
              $interval.cancel(interval);
            }
          }, 100, 30, false);
        }
      });

      $scope.$on('conferencestate:attendees:remove', function(event, data) {
        conferenceAPI.get($scope.conferenceId).then(function(response) {
          $scope.conferenceState.conference = response.data;
        }, function(err) {
          $log.error('Cannot get conference', $scope.conferenceId, err);
        });

        if (data && data.videoIds === $scope.conferenceState.localVideoId) {
          $log.debug('Stream first attendee to main canvas');
          $scope.conferenceState.updateLocalVideoIdToIndex(0);
        }
      });

      // We must wait for the directive holding the template containing videoIds
      // to be displayed in the browser before using easyRTC.
      var unregisterLocalVideoWatch = $scope.$watch(function() {
        return angular.element('#' + LOCAL_VIDEO_ID)[0];
      }, function(video) {
        if (video) {
          webRTCService.connect($scope.conferenceState, function(err) {
            if (err) {
              showConnectionError(err);
            }
            unregisterLocalVideoWatch();
          });
        }
      });

      function showConnectionError(err) {
        $log.error('Error while connecting to conference', err);
        conferenceErrorDialogsService.onConnectError(err);
      }
    }
  }
})(angular);
