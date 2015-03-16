'use strict';


angular.module('meetings.conference', ['meetings.user', 'meetings.uri', 'meetings.session'])
  .factory('conferenceService', ['conferenceAPI', 'session', function(conferenceAPI, session) {
    function create(conferenceName, displayName) {
      return conferenceAPI.create(conferenceName, displayName);
    }

    function enter(conferenceName, displayName) {
      return conferenceAPI.get(conferenceName, displayName).then(function(response) {
        session.setConference(response.data);
        return response;
      });
    }

    function addMember() {

    }

    function redirectTo() {

    }

    return {
      create: create,
      enter: enter,
      addMember: addMember,
      redirectTo: redirectTo
    };
  }])
  .factory('conferenceAPI', ['$q', '$window', 'Restangular', function($q, $window, Restangular) {
    function get(id, displayName) {
      var href = $window.location.origin + '/' + encodeURIComponent(id);
      return Restangular.one('conferences', id).get({displayName: displayName}).then(function(response) {
        response.data.href = href;
        return response;
      });
    }

    function getMembers(conferenceId) {
      return Restangular.one('conferences', conferenceId).getList('members');
    }

    function updateMemberField(id, memberId, field, value) {
      return Restangular.one('conferences', id).one('members', memberId).one(field).customPUT({value: value});
    }

    function create(id, displayName) {
      return Restangular.one('conferences', id).put({displayName: displayName});
    }

    function getOrCreate(id, displayName) {
      return Restangular.one('conferences', id).get({displayName: displayName});
    }

    function addMembers(id, members) {
      return Restangular.one('conferences', id).all('members').customPUT(members);
    }

    function redirectTo(id, tokenUuid) {
      return Restangular.one('conferences').get({token: tokenUuid});
    }

    return {
      get: get,
      create: create,
      getOrCreate: getOrCreate,
      addMembers: addMembers,
      redirectTo: redirectTo,
      getMembers: getMembers,
      updateMemberField: updateMemberField
    };
  }])
  .factory('feedbackAPI', ['Restangular', function(Restangular) {
    function postFeedback(data) {
      return Restangular.all('api/feedback').post(data);
    }

    return {
      postFeedback: postFeedback
    };
  }])
  .controller('meetingsLandingPageController', ['$scope', '$alert', 'feedbackAPI', function($scope, $alert, feedbackAPI) {
    $scope.alert = function(type, message) {
      $alert({
        content: message,
        container: '.feedback-form',
        placement: 'top',
        type: type,
        duration: 3,
        show: true
      });
    };

    $scope.sendFeedback = function() {
      if ($scope.sendingFeedbackFrom) {
        return;
      }

      $scope.sendingFeedbackFrom = true;

      feedbackAPI.postFeedback($scope.feedbackForm).then(function() {
        $scope.alert('success', 'Your message was sent successfully. Thanks for the feedback!');
      }, function() {
        $scope.alert('warning', 'Oops, this is embarrassing. Please try again later!');
      }).finally (function() {
        $scope.feedbackForm = {};
        $scope.sendingFeedbackFrom = false;
      });
    };
  }])
  .directive('conferenceCreateForm', ['$window', '$log', 'conferenceService', '$location', 'URI', 'conferenceNameGenerator',
    function($window, $log, conferenceService, $location, URI, conferenceNameGenerator) {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/conference/conference-create-form.html',
      link: function(scope) {
        function buildUrl(room) {
          return URI('/')
          .query('')
          .fragment('')
          .segmentCoded(room);
        }

        scope.room = conferenceNameGenerator.getName();

        function escapeRoomName(room) {
          var result = room.replace(/\s+/g, '');

          //removes all url associated characters : , / ? : @ & = + $ #
          result = result.replace(/[,\/\?:@&=\+\$#]+/g, '');

          var blackList = [
            'api',
            'components',
            'views',
            'js',
            'css',
            'images',
            'favicon.ico'];
          if (blackList.indexOf(result) >= 0) { result = ''; }

          return result;
        }

        scope.go = function() {
          var escapedName = escapeRoomName(scope.room);
          if (escapedName === '') {
            $window.location.href = buildUrl(conferenceNameGenerator.getName());
          }
          else {
            $window.location.href = buildUrl(escapedName);
          }
        };
      }
    };
  }])
  .controller('goodbyeController', ['$scope', '$window', 'session', function($scope, $window, session) {
    $scope.reopen = function() {
      $window.location.href = '/' + session.conference._id + '?displayName=' + session.user.displayName;
    };
  }]).directive('usernameForm', [function() {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/live-conference/username-form.html'
    };
  }]).directive('browserAuthorizationDialog', ['$window', '$rootScope', function($window, $rootScope) {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/live-conference/browser-authorization-dialog.html',
      replace: true,
      link: function(scope, element) {
        $window.easyrtc.setGotMedia(function(gotMediaCB, errorText) {
          element.modal('hide');
        });

        function interceptStream(callback) {
          return function(mediaStream) {
            $rootScope.$emit('localMediaStream', mediaStream);
            callback(mediaStream);
          };
        }

        var oldGetUserMedia = $window.getUserMedia;
        $window.getUserMedia = function getUserMedia(constraints, successCallback, errorCallback) {
          element.modal('show');
          oldGetUserMedia(constraints, interceptStream(successCallback), errorCallback);
        };
      }
    };
  }])
  .constant('conferenceNameGeneratorConstants', {
    adverbs: [
      'absentmindedly', 'adoringly', 'awkwardly', 'beautifully', 'briskly', 'brutally', 'carefully', 'cheerfully',
      'competitively', 'eagerly', 'effortlessly', 'extravagantly', 'girlishly', 'gracefully', 'grimly', 'happily',
      'halfheartedly', 'hungrily', 'lazily', 'lifelessly', 'loyally', 'quickly', 'quietly', 'quizzically', 'really',
      'recklessly', 'remorsefully', 'ruthlessly', 'savagely', 'sloppily', 'so', 'stylishly', 'unabashedly',
      'unevenly', 'urgently', 'well', 'wishfully', 'worriedly'
    ],
    adjectives: [
      'awesome', 'yolo', 'wooot', 'super', 'magic', 'simple', 'fast', 'open', 'free', 'great', 'cool', 'pretty',
      'exquisite', 'stunning', 'radiant', 'amazing', 'delightful', 'dreamy', 'fine', 'hypnotic', 'marvelous', 'sublime',
      'smoking', 'adorable', 'beautiful', 'handsome', 'lovely', 'bewitching', 'breathtaking', 'charming', 'divine',
      'enchanting', 'fabulous', 'glamorous', 'perfect', 'spectacular', 'wonderful', 'magnificent', 'wondrous',
      'miraculous', 'attractive', 'galvanizing', 'remarkable', 'sensational', 'prodigious'
    ],
    nouns: [
      'toulouse', 'paris', 'lyon', 'montpellier', 'hamburg', 'canada', 'linux', 'mail', 'security', 'store', 'share',
      'software', 'paas', 'angular', 'agile', 'studio', 'config', 'service', 'app', 'video', 'webrtc', 'agenda',
      'montreal', 'vietnam', 'puteaux', 'software', 'node', 'conference', 'team', 'network', 'meeting', 'website',
      'camera', 'grenoble', 'saas', 'iaas', 'db', 'france', 'germany', 'social', 'hanoi', 'barbecue', 'babyfoot',
      'penguin', 'labs', 'tunisia', 'djerba', 'party', 'opensource', 'geeks'
    ]
  })
  .factory('conferenceNameGenerator', ['conferenceNameGeneratorConstants', function(nameGenerator) {
    return {
      getName: function() {
        var adverb = nameGenerator.adverbs[Math.floor(Math.random() * nameGenerator.adverbs.length)];
        var adjective = nameGenerator.adjectives[Math.floor(Math.random() * nameGenerator.adjectives.length)];
        var noun = nameGenerator.nouns[Math.floor(Math.random() * nameGenerator.nouns.length)];
        return adverb + '-' + adjective + '-' + noun;
      }
    };
  }]);
