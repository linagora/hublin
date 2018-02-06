'use strict';

angular.module('meetings.configuration', ['meetings.session', 'meetings.wizard', 'meetings.user'])
  .factory('configurationService', ['$q', '$log', 'session', 'configurationHandlerService', function($q, $log, session, configurationHandlerService) {
    function configure(configuration) {
      $log.debug('Configuring conference', configurationHandlerService.getHandlers());

      var jobs = configurationHandlerService.getHandlers().map(function(handler) {
        return handler(configuration);
      });

      return $q.all(jobs);
    }

    return {
      configure: configure
    };

  }])
  .factory('configurationHandlerService', [function() {
    var handlers = [];

    function register(handler) {
      if (!handler) {
        return;
      }
      handlers.push(handler);
    }

    function getHandlers() {
      return handlers;
    }

    return {
      register: register,
      getHandlers: getHandlers
    };
  }])
  .directive('conferenceConfiguration', ['$log', 'widget.wizard', 'session', 'configurationService', 'userService', function($log, Wizard, session, configurationService, userService) {

    function link($scope) {

      $scope.configuration = {
        displayName: userService.getDisplayName()
      };
      $scope.lengthError = false;

      $scope.createConference = function() {
        configurationService.configure($scope.configuration)
          .then(onSuccess, onFailure);
      };

      $scope.wizard = new Wizard([
        '/views/live-conference/partials/configuration/username.html'
      ], $scope.createConference);

      function onSuccess() {
        $log.info('Conference has been configured');
        session.setConfigured(true);
      }

      function onFailure(err) {
        $log.error('Failed to configure', err);
        session.setConfigured(false);
      }

      $scope.onUsernameChange = function() {
        if (!$scope.configuration.displayName) {
          return;
        }

        if ($scope.configuration.displayName.length >= 200) {
          $scope.configuration.displayName = $scope.configuration.displayName.slice(0, 199 - $scope.configuration.displayName.length);
          $scope.lengthError = true;
        } else if ($scope.configuration.displayName.length === 199) {
          $scope.lengthError = true;
        } else {
          $scope.lengthError = false;
        }
      };

    }

    return {
      restrict: 'E',
      templateUrl: '/views/modules/configuration/configuration.html',
      link: link
    };
  }])
  .directive('bitrateConfiguration', ['webRTCService', 'RTC_BITRATES', 'RTC_DEFAULT_BITRATE', 'localStorageService', function(webRTCService, RTC_BITRATES, RTC_DEFAULT_BITRATE, localStorageService) {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/configuration/bitrate-configuration.html',
      link: function($scope) {
        var bitRates = Object.keys(RTC_BITRATES);
        var storage = localStorageService.getOrCreateInstance('roomConfiguration');

        $scope.selectBitRate = function(rate) {
          if (bitRates.indexOf(rate) >= 0) {
            storage.setItem('bitRate', rate).finally(function() {
              $scope.selected = rate;
              webRTCService.configureBandwidth(rate);
            });
          }
        };

        $scope.isSelected = function(rate) {
          return $scope.selected === rate;
        };

        storage.getItem('bitRate').then(function(config) {
          if (config) {
            $scope.selectBitRate(config);
          } else {
            $scope.selectBitRate(RTC_DEFAULT_BITRATE);
          }
        },
          function() {
            $scope.selectBitRate(RTC_DEFAULT_BITRATE);
          });

      }
    };
  }])
  .directive('disableVideoConfiguration', ['$alert', '$window', 'webRTCService', function($alert, $window, webRTCService) {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/configuration/disable-video-configuration.html',
      link: function($scope) {
        var navigator = $window.navigator;
        var alertElement;

        $scope.videoEnabled = webRTCService.isVideoEnabled();

        $scope.canEnumerateDevices = false;
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia({ audio: false, video: true })
          .then(function() {
            $scope.canEnumerateDevices = navigator.mediaDevices && angular.isDefined(navigator.mediaDevices.enumerateDevices);
            $scope.$applyAsync();
          });

        $scope.$watch('videoEnabled', function() {
          webRTCService.enableVideo($scope.videoEnabled);
          if (!$scope.videoEnabled) {
            alertElement = $alert({
              container: '#disableVideoWarning',
              template: '/views/modules/configuration/disable-video-alert.html',
              duration: 5
            });
          } else if (alertElement) {
            alertElement.hide();
            alertElement = null;
          }
        });
      }
    };
  }]);
