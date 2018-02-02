(function(angular) {
  'use strict';

  angular.module('meetings.invitation')
    .controller('invitationDialogController', invitationDialogController);

  function invitationDialogController(
    $mdDialog,
    $scope,
    $alert,
    notificationFactory,
    conferenceAPI,
    invitationService,
    currentConferenceState
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.formHasError = formHasError;
    self.remove = remove;
    self.add = add;
    self.autocomplete = autocomplete;
    self.sendInvitations = sendInvitations;
    self.cancel = cancel;

    function cancel() {
      $mdDialog.cancel();
    }

    function $onInit() {
      self.contacts = {};
      self.contactCount = 0;
      self.conference = currentConferenceState.conference;
      self.rawURI = decodeURIComponent(self.conference.href);
    }

    function formHasError(inviteForm) {
      var inviteText = inviteForm.inviteText;

      return inviteText.$viewValue && inviteText.$invalid;
    }

    function remove(who) {
      delete self.contacts[who.id];
      self.contactCount = Object.keys(self.contacts).length;
    }

    function add() {
      invitationService.lookup(self.inviteText).then(function(res) {
        if (res) {
          self.contacts[res.id] = res;
          self.contactCount = Object.keys(self.contacts).length;
        }
        self.inviteText = '';
      });
    }

    function autocomplete(input) {
      return invitationService.autocomplete(input);
    }

    $scope.$on('$typeahead.select', function(scope, res) {
      self.contacts[res.id] = res;
      self.contactCount = Object.keys(self.contacts).length;
      self.inviteText = '';
      $scope.$digest();
    });

    function sendInvitations() {
      var members = Object.values(self.contacts) || [];

      self.contacts = {};
      conferenceAPI.addMembers(self.conference._id, members).then(function() {
        notificationFactory.weakInfo('Invitations sent', 'Your contacts will join shortly');
      }, function(response) {
        // TODO
        $alert({
          content: response.data && response.data.message ? response.data.message : response.data.toString(),
          type: 'danger',
          show: true,
          container: '#' + self.dialogId + ' .error',
          duration: '3',
          animation: 'am-fade'
        });
      });
    }
  }
})(angular);
