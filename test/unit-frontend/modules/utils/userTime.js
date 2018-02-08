'use strict';

/* global chai, sinon: false */
/* global moment: false */

var expect = chai.expect;

describe('Directives', function() {
  var momentInjection = angular.noop();
  var $interval = {};
  var currentConferenceState, $rootScope, $compile;
  var htmlTemplate = '<div user-time>{{remoteHour}}</div>';

  beforeEach(function() {
    window.URI = function() {};
    module('angularMoment');
    module('op.live-conference');
    module('meetings.pug.templates');

    $interval = angular.noop;
  });

  describe('userTime directive', function() {
    beforeEach(function() {
      module(function($provide) {
        $provide.constant('moment', function() {
          return momentInjection();
        });
        $provide.value('session', {
          conference: {}
        });
        $provide.value('$interval', $interval);
      });
      inject(function(_currentConferenceState_, _$rootScope_, _$compile_) {
        currentConferenceState = _currentConferenceState_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
      });
    });

    it('should listen "conferencestate:localVideoId:update" event', function(done) {
      var scope = $rootScope.$new();

      scope.$on = function(evt) {
        if (evt === 'conferencestate:localVideoId:update') {
          done();
        }
      };
      $compile(htmlTemplate)(scope);
    });

    it('should listen "$destroy" event', function(done) {
      var scope = $rootScope.$new();

      scope.$on = function(evt) {
        if (evt === '$destroy') {
          done();
        }
      };
      $compile(htmlTemplate)(scope);
    });

    it('should stop the interval on "$destroy"', function() {
      var scope = $rootScope.$new();

      $compile(htmlTemplate)(scope);
      $interval.cancel = sinon.spy();
      scope.$destroy();

      expect($interval.cancel).to.have.been.calledOnce;
    });

    it('should change scope.color when attendee video is turned off', function() {
      var scope = $rootScope.$new();

      $compile(htmlTemplate)(scope);
      scope.color = 'black';
      currentConferenceState.getAttendeeByVideoId = function() {
        return {muteVideo: true};
      };
      scope.$emit('conferencestate:localVideoId:update');
      scope.$digest();
      expect(scope.color).to.not.equal('black');
    });

    describe('conferencestate:localVideoId:update event handler', function() {
      var scope;

      beforeEach(function() {
        scope = $rootScope.$new();
        $compile(htmlTemplate)(scope);
      });

      describe('when timezones are the same for all attendees', function() {
        it('should set scope.remoteHour to null', function() {
          scope.remoteHour = '12:24 pm';
          currentConferenceState.getAttendeeByVideoId = function() {
            return {timezoneOffset: 120};
          };
          $rootScope.$broadcast('conferencestate:localVideoId:update');
          $rootScope.$digest();
          expect(scope.remoteHour).to.not.be.ok;
        });
      });

      describe('when timezones are not the same for all attendees', function() {
        it('should set scope.remoteHour to the time difference', function() {
          var attendees = [
            {timezoneOffset: -120},
            {timezoneOffset: -330},
            {timezoneOffset: -220}
          ];

          momentInjection = function() {
            return moment.tz('2015-09-30 11:00', 'Europe/Paris');
          };
          currentConferenceState.getAttendeeByVideoId = function() {
            return attendees.shift();
          };
          $rootScope.$broadcast('conferencestate:localVideoId:update');
          $rootScope.$digest();
          expect(scope.remoteHour).to.equal('02:30 pm');
        });
      });
    });
  });
});
