'use strict';

angular.module('op.live-conference', [
  'op.liveconference-templates',
  'op.easyrtc',
  'op.websocket',
  'op.notification',
  'meetings.authentication',
  'meetings.session',
  'meetings.conference',
  'meetings.invitation'
]).controller('conferenceController', [
  '$scope',
  '$log',
  'session',
  'conference',
  function($scope, $log, session, conference) {
    $scope.templates = {
      username: '/views/live-conference/partials/username',
      conference: '/views/live-conference/partials/conference'
    };
    $scope.conference = conference;
    $scope.process = {
      step: 'username'
    };

    session.initialized.then(function() {
      $scope.process.step = 'conference';
    });
  }
]).controller('liveConferenceController', [
  '$scope',
  '$log',
  '$timeout',
  'session',
  'conferenceAPI',
  'easyRTCService',
  'conferenceHelpers',
  function($scope, $log, $timeout, session, conferenceAPI, easyRTCService, conferenceHelpers) {
    $scope.users = [];
    $scope.attendees = [];
    $scope.idToAttendeeNameMap = {};
    $scope.mainVideoId = 'video-thumb0';
    $scope.attendeeVideoIds = [
      'video-thumb0',
      'video-thumb1',
      'video-thumb2',
      'video-thumb3',
      'video-thumb4',
      'video-thumb5',
      'video-thumb6',
      'video-thumb7',
      'video-thumb8'
    ];

    $scope.$on('$locationChangeStart', easyRTCService.leaveRoom($scope.conference));

    $scope.getMainVideoAttendeeIndex = function(mainVideoId) {
      return conferenceHelpers.getMainVideoAttendeeIndexFrom(mainVideoId);
    };

    $scope.streamToMainCanvas = function(index) {
      $scope.mainVideoId = $scope.attendeeVideoIds[index];
    };

    $scope.showInvitation = function() {
      $('#invite').modal('show');
    };
    $scope.onLeave = function() {
      $log.log('leave conference call');
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
        $scope.idToAttendeeNameMap = conferenceHelpers.mapUserIdToName($scope.users);
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
        easyRTCService.connect($scope.conference, $scope.mainVideoId, $scope.attendees);
        unregister();
      }
    });
  }
]).directive('liveConferenceNotification', ['$log', 'session', 'notificationFactory', 'livenotification',
  function($log, session, notificationFactory, livenotification) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        function liveNotificationHandler(msg) {
          $log.debug('Got a live notification', msg);
   }])
         if (msg.user_id !== session.user._id) {
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
