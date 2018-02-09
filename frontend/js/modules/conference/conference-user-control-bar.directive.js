(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .directive('conferenceUserControlBar', conferenceUserControlBar);

  function conferenceUserControlBar($log, webRTCService) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/modules/conference/conference-user-control-bar.html',
      scope: {
        showInvitation: '=',
        onLeave: '=',
        conferenceState: '=',
        showEditor: '='
      },
      link: link
    };

    function link($scope) {
      $scope.muted = false;
      $scope.videoMuted = false;
      $scope.noVideo = !webRTCService.isVideoEnabled();

      $scope.toggleSound = function() {
        webRTCService.enableMicrophone($scope.muted);

        $scope.muted = !$scope.muted;
        $scope.conferenceState.updateMuteFromIndex(0, $scope.muted);

        webRTCService.broadcastMe();
      };

      $scope.toggleCamera = function() {
        webRTCService.enableCamera($scope.videoMuted);
        webRTCService.enableVideo($scope.videoMuted);

        $scope.videoMuted = !$scope.videoMuted;
        $scope.conferenceState.updateMuteVideoFromIndex(0, $scope.videoMuted);

        webRTCService.broadcastMe();
      };

      $scope.showInvitationPanel = function() {
        $scope.showInvitation();
      };

      $scope.leaveConference = function() {
        $scope.onLeave();
      };
      $scope.toggleEditor = function() {
        $scope.showEditor();
      };
    }
  }
})(angular);
