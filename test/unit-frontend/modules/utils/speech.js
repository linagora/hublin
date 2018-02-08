'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The speech module', function() {
  beforeEach(angular.mock.module('op.live-conference'));

  describe('autoVideoSwitcher service', function() {
    var autoVideoSwitchService,
        $rootScope,
        $timeout,
        conferenceState,
        getAttendeeByRtcidSpy,
        updateLocalVideoIdSpy;

    beforeEach(function() {
      conferenceState = {
        getAttendeeByRtcid: function(data) {
          return getAttendeeByRtcidSpy(data);
        },
        updateLocalVideoId: function(videoId) {
          return updateLocalVideoIdSpy(videoId);
        },
        localVideoId: 'video-thumb1'
      };
      getAttendeeByRtcidSpy = {};
      updateLocalVideoIdSpy = {};

      var AutoVideoSwitcher = {};
      inject(function($injector) {
        $rootScope = $injector.get('$rootScope');
        $timeout = $injector.get('$timeout');
        AutoVideoSwitcher = $injector.get('AutoVideoSwitcher');
      });

      autoVideoSwitchService = new AutoVideoSwitcher(conferenceState);
    });

    it('should call onSpeech if speaking is true', function(done) {
      autoVideoSwitchService.onSpeech = function() {
        done();
      };
      autoVideoSwitchService.onSpeechEnd = function() {
        throw new Error('should not be here');
      };
      $rootScope.$broadcast('conferencestate:speaking', {speaking: true});
    });

    it('should call onSpeechEnd if speaking is false', function(done) {
      autoVideoSwitchService.onSpeech = function() {
        throw new Error('should not be here');
      };
      autoVideoSwitchService.onSpeechEnd = function() {
        done();
      };
      $rootScope.$broadcast('conferencestate:speaking', {speaking: false});
    });

    describe('onSpeech method', function() {

      it('should do nothing if member does not exist', function(done) {
        getAttendeeByRtcidSpy = function() {
          return null;
        };

        $rootScope.$broadcast('conferencestate:speaking', {speaking: true});
        try {
          $timeout.flush();
        } catch (e) {
          expect(autoVideoSwitchService.timeouts).to.deep.equal({});
          done();
        }
        throw new Error('should not be here');
      });

      it('should do nothing if member.videoId is LOCAL_VIDEO_ID', function(done) {
        getAttendeeByRtcidSpy = function() {
          return {
            videoId: 'video-thumb0'
          };
        };

        $rootScope.$broadcast('conferencestate:speaking', {speaking: true});
        try {
          $timeout.flush();
        } catch (e) {
          expect(autoVideoSwitchService.timeouts).to.deep.equal({});
          done();
        }
        throw new Error('should not be here');
      });

      it('should do nothing if member is muted', function(done) {
        getAttendeeByRtcidSpy = function() {
          return {
            mute: true,
            videoId: 'video-thumb2'
          };
        };

        $rootScope.$broadcast('conferencestate:speaking', {speaking: true});
        try {
          $timeout.flush();
        } catch (e) {
          expect(autoVideoSwitchService.timeouts).to.deep.equal({});
          done();
        }
        throw new Error('should not be here');
      });

      it('should do nothing if member.videoId is current localVideoId', function(done) {
        getAttendeeByRtcidSpy = function() {
          return {
            videoId: 'video-thumb1'
          };
        };

        $rootScope.$broadcast('conferencestate:speaking', {speaking: true});
        try {
          $timeout.flush();
        } catch (e) {
          expect(autoVideoSwitchService.timeouts).to.deep.equal({});
          done();
        }
        throw new Error('should not be here');
      });

      it('should add a new entry to timeouts and call updateLocalVideoId after timeout', function() {
        getAttendeeByRtcidSpy = function() {
          return {
            videoId: 'video-thumb2',
            rtcid: 'rtcid'
          };
        };

        updateLocalVideoIdSpy = function(videoId) {
          autoVideoSwitchService.conferenceState.localVideoId = videoId;
        };

        $rootScope.$broadcast('conferencestate:speaking', {speaking: true});
        expect(autoVideoSwitchService.timeouts.rtcid).to.exist;
        expect(autoVideoSwitchService.conferenceState.localVideoId).to.equal('video-thumb1');
        $timeout.flush();
        expect(autoVideoSwitchService.conferenceState.localVideoId).to.equal('video-thumb2');
      });

      it('should add only 1 timeout even avec several broadcast', function() {
        getAttendeeByRtcidSpy = function() {
          return {
            videoId: 'video-thumb2',
            rtcid: 'rtcid'
          };
        };

        updateLocalVideoIdSpy = function(videoId) {
          autoVideoSwitchService.conferenceState.localVideoId = videoId;
        };

        $rootScope.$broadcast('conferencestate:speaking', {speaking: true});
        $rootScope.$broadcast('conferencestate:speaking', {speaking: true});
        $rootScope.$broadcast('conferencestate:speaking', {speaking: true});
        expect(autoVideoSwitchService.timeouts.rtcid.$$timeoutId).to.equal(0);
        expect(autoVideoSwitchService.conferenceState.localVideoId).to.equal('video-thumb1');
        $timeout.flush();
        expect(autoVideoSwitchService.conferenceState.localVideoId).to.equal('video-thumb2');
      });
    });

    describe('onSpeechEnd method', function() {

      it('should do nothing if member does not exist', function() {
        getAttendeeByRtcidSpy = function() {
          return null;
        };

        $rootScope.$broadcast('conferencestate:speaking', {speaking: false});
        expect(autoVideoSwitchService.timeouts).to.deep.equal({});
      });

      it('should do nothing if no entry in this.timeouts is found', function() {
        autoVideoSwitchService.timeouts.bar = ['fake'];
        getAttendeeByRtcidSpy = function() {
          return {
            rtcid: 'foo'
          };
        };

        $rootScope.$broadcast('conferencestate:speaking', {speaking: false});
        expect(autoVideoSwitchService.timeouts).to.deep.equal({
          bar: ['fake']
        });
      });

      it('should do nothing if member.videoId is LOCAL_VIDEO_ID', function() {
        autoVideoSwitchService.timeouts.bar = ['fake'];
        autoVideoSwitchService.timeouts.foo = ['fake'];
        getAttendeeByRtcidSpy = function() {
          return {
            rtcid: 'foo',
            videoId: 'video-thumb0'
          };
        };

        $rootScope.$broadcast('conferencestate:speaking', {speaking: false});
        expect(autoVideoSwitchService.timeouts).to.deep.equal({
          bar: ['fake'],
          foo: ['fake']
        });
      });

      it('should set correct this.timeouts to null and cancel it inside $timeout', function() {
        autoVideoSwitchService.timeouts.bar = ['fake'];
        autoVideoSwitchService.timeouts.foo = ['fake'];
        getAttendeeByRtcidSpy = function() {
          return {
            rtcid: 'foo',
            videoId: 'video-thumb1'
          };
        };

        $rootScope.$broadcast('conferencestate:speaking', {speaking: true});
        expect(autoVideoSwitchService.timeouts.foo).to.exist;

        $rootScope.$broadcast('conferencestate:speaking', {speaking: false});
        expect(autoVideoSwitchService.timeouts.foo).to.not.exist;
        expect(autoVideoSwitchService.timeouts).to.deep.equal({
          bar: ['fake'],
          foo: null
        });
      });
    });
  });

});
