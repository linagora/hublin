'use strict';

angular.module('meetings.report', [])
  .directive('reportDialog', ['conferenceAPI', '$alert', 'notificationFactory', '$log', function(conferenceAPI, $alert, notificationFactory, $log) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/modules/report/report-dialog.html',
      link: function($scope, element, attrs) {

        $scope.alertDisplayed = null;

        $scope.hide = function() {
          element.modal('hide');
        };

        $scope.sendReport = function() {

          var description = $scope.reportedText;
          $scope.resetModal();

          var getArrayOfMemberId = function(arrayOfMembers) {
            var arrayOfId = [];
            for (var i = 0; i < arrayOfMembers.length; i++)
            {
              if (arrayOfMembers[i]) {
                arrayOfId.push(arrayOfMembers[i].id);
              }
            }
            return arrayOfId;
          };

          conferenceAPI.createReport($scope.reportedAttendee.id, $scope.conferenceState.conference._id, getArrayOfMemberId($scope.conferenceState.attendees), description).then(
            function(response) {
              $log.info('Successfully created report with response', response);
              notificationFactory.weakInfo('Report ' + $scope.reportedAttendee.displayName, 'Report has been sent !');
              $scope.hide();
              return response.data;
            },
            function(err) {
              $log.error('Failed to create report', err);
              $scope.displayError('Failed to create report');
              return err;
            }
          );
        };

        $scope.displayError = function(err) {
          $scope.alertDisplayed = $alert({
            content: err,
            type: 'danger',
            show: true,
            position: 'bottom',
            container: '#reporterror',
            animation: 'am-fade'
          });
        };

        $scope.resetModal = function() {
          if ($scope.alertDisplayed) {
            $scope.alertDisplayed.destroy();
            $scope.alertDisplayed = null;
          }
          $scope.reportedText = '';
        };

      }
    };
  }]);
