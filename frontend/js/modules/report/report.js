'use strict';

angular.module('meetings.report', [])
  .directive('reportDialog', ['$alert', 'notificationFactory', 'session', '$log', function($alert, notificationFactory, session, $log) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/modules/report/report-dialog.html',
      link: function($scope, element, attrs) {

        $scope.hide = function() {
          element.modal('hide');
        };

        $scope.sendReport = function() {
          $log.debug('TimeStamp:' + new Date());
          $log.debug('Reporter:' + JSON.stringify(session.user));
          $log.debug('Reported:' + $scope.reportedAttendee);
          $log.debug('ReportedText:' + $scope.reportedText);
          $log.debug('Conference' + JSON.stringify($scope.conference));
        };
      }
    };
  }]);
