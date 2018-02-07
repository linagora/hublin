(function() {
  'use strict';

  angular.module('op.live-conference')
    .component('attendeeSettingsDropdown', {
      templateUrl: '/views/modules/attendee/attendee-settings-dropdown.html',
      bindings: {
        attendee: '=',
        toggleAttendeeMute: '=',
        showReportPopup: '='
      },
      controller: function() {
        this.openMenu = function($mdMenu, ev) {
          $mdMenu.open(ev);
        };
      }
    });
})();
