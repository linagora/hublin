(function(angular) {
  'use strict';

  angular.module('meetings.invitation')
    .controller('invitationDialogController', invitationDialogController);

  function invitationDialogController(
    $scope,
    $log,
    $mdDialog,
    notificationFactory,
    conferenceAPI,
    emailIsValid,
    currentConferenceState
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.validateEmail = validateEmail;
    self.sendInvitations = sendInvitations;
    self.cancel = cancel;

    function $onInit() {
      self.contacts = [];
      self.conference = currentConferenceState.conference;
      self.rawURI = decodeURIComponent(self.conference.href);
    }

    function cancel() {
      $mdDialog.cancel();
    }

    // Waiting for https://github.com/angular/material/pull/10481 to be merged
    // for now we validate by checking if the text is an email return null if not an email
    function validateEmail(chip) {
      if (!emailIsValid(chip)) {
        return null;
      }

      return { objectType: 'email', id: chip };
    }

    function sendInvitations() {
      conferenceAPI.addMembers(self.conference._id, self.contacts).then(function() {
        notificationFactory.weakInfo('Invitations sent', 'Your contacts will join shortly');
        $mdDialog.hide();
      }, function(err) {
        $log.error(err);
        notificationFactory.weakError('Invitations not sent', 'There was an issue while sending invitations');
      });
    }
  }
})(angular);
