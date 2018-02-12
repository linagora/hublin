'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The conferenceUserMediaInterceptorService service', function() {
  var conferenceUserMediaInterceptorService, $rootScope, oldAPI, oldGetUserMedia, getUserMediaStub, oldMediaDevicesGetUserMedia, $window, $q;

  beforeEach(function() {
    module('meetings.conference');
    module('meetings.pug.templates');
  });

  beforeEach(inject(function(_conferenceUserMediaInterceptorService_, _$window_, _$q_, _$rootScope_) {
    conferenceUserMediaInterceptorService = _conferenceUserMediaInterceptorService_;
    $window = _$window_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function() {
    oldGetUserMedia = $window.navigator.getUserMedia;
    getUserMediaStub = sinon.stub();

    if (!$window.navigator.mediaDevices) {
      oldAPI = true;
      $window.navigator.mediaDevices = {
        getUserMedia: getUserMediaStub
      };
    } else {
      oldMediaDevicesGetUserMedia = $window.navigator.mediaDevices.getUserMedia;
      $window.navigator.mediaDevices.getUserMedia = getUserMediaStub;
    }
  });

  afterEach(function() {
    $window.navigator.getUserMedia = oldGetUserMedia;
    $window.navigator.mediaDevices.getUserMedia = oldMediaDevicesGetUserMedia;
    if (oldAPI) {
      delete $window.navigator.mediaDevices;
    }
  });

  describe('on $window.navigator.getUserMedia calls', function() {
    it('should override navigator.getUserMedia to use fallback constraints on constraints error', function() {
      var callCount = 0;

      $window.navigator.getUserMedia = function(constraints, onSuccess, onError) {
        callCount++;
        if (callCount === 1) {
          onError();
        } else {
          expect(constraints).to.eql({ audio: true, video: true });
        }
      };

      conferenceUserMediaInterceptorService();
      $window.navigator.getUserMedia({}, angular.noop, angular.noop);

      expect(callCount).to.equal(2);
    });
  });

  describe('on $window.navigator.mediaDevices.getUserMedia calls', function() {
    it('should emit stream on rootscope', function(done) {
      var stream = 'Hey I am the stream ';
      var constraints = 'The constraints';
      var emitSpy = sinon.spy($rootScope, '$emit');

      getUserMediaStub.onCall(0).returns($q.resolve(stream));

      conferenceUserMediaInterceptorService();

      $window.navigator.mediaDevices.getUserMedia(constraints).then(function() {
        expect(getUserMediaStub).to.have.been.calledWith(constraints);
        expect(getUserMediaStub).to.have.been.calledOnce;
        expect(emitSpy).to.have.been.calledWith('localMediaStream', stream);
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should override navigator.mediaDevices.getUserMedia to use fallback constraints on constraints error', function(done) {
      var constraints = 'The constraints';

      getUserMediaStub.onCall(0).returns($q.reject(new Error('First call failed')));
      getUserMediaStub.onCall(1).returns($q.resolve());

      conferenceUserMediaInterceptorService();

      $window.navigator.mediaDevices.getUserMedia(constraints).then(function() {
        expect(getUserMediaStub).to.have.been.calledWith(constraints);
        expect(getUserMediaStub).to.have.been.calledWith({audio: true, video: true});
        expect(getUserMediaStub).to.have.been.calledTwice;
        done();
      }, done);

      $rootScope.$digest();
    });
  });
});
