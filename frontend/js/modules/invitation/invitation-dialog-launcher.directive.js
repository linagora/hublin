(function(angular) {
  'use strict';

  angular.module('meetings.invitation')
    .directive('invitationDialogLauncher', invitationDialogLauncher);

  function invitationDialogLauncher($log, $timeout, $stateParams) {
    return {
      restrict: 'A',
      require: 'liveConference',
      link: link
    };

    function link($scope) {
      if ($stateParams.noAutoInvite) {
        $log.debug('Not launching invitation dialog as requested.');

        return;
      }

      $scope.$on('localMediaReady', function() {
        var connectedMembers = $scope.conferenceState.conference.members.some(function(member) {
          return member.status === 'online';
        });

        if (!connectedMembers) {
          $scope.showInvitation();
        }
      });
    }
  }
})(angular);
