(function(angular) {
  'use strict';

  angular.module('meetings.invitation')
    .factory('invitationDialogLauncherService', invitationDialogLauncherService);

  function invitationDialogLauncherService($log, $mdDialog) {
    return {
      show: show
    };

    function show() {
      $mdDialog.show({
        controller: 'invitationDialogController',
        controllerAs: 'ctrl',
        templateUrl: '/views/modules/invitation/invitation-dialog.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true
      })
      .then(function() {
        $log.debug('Invitations has been sent');
      }, function() {
        $log.debug('Invitation is cancelled');
      });
    }
  }
})(angular);
