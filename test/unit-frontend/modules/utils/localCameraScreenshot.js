'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The localCameraScreenshot service', function() {
  var localCameraScreenshot, newImage, newCanvas, currentConferenceState,
      LOCAL_VIDEO_ID, thumbnail, width, height, DEFAULT_AVATAR_SIZE;

  beforeEach(angular.mock.module('op.live-conference'));

  beforeEach(function() {
    newImage = {};
    newCanvas = {
      getContext: function() {
        return {
          drawImage: function(image, _top, _left, _width, _height) {
            expect(image).to.equal(thumbnail);

            width = _width;
            height = _height;
          }
        };
      },
      toDataURL: function() {
        return 'data:' + width + ',' + height;
      }
    };
    currentConferenceState = {};

    module(function($provide) {
      $provide.value('newImage', function() {
        return newImage;
      });
      $provide.value('newCanvas', function() {
        return newCanvas;
      });
      $provide.value('currentConferenceState', currentConferenceState);
    });

    inject(function(_localCameraScreenshot_, _LOCAL_VIDEO_ID_, _DEFAULT_AVATAR_SIZE_) {
      localCameraScreenshot = _localCameraScreenshot_;
      LOCAL_VIDEO_ID = _LOCAL_VIDEO_ID_;
      DEFAULT_AVATAR_SIZE = _DEFAULT_AVATAR_SIZE_;
    });
  });

  beforeEach(function() {
    thumbnail = document.createElement('canvas');
    thumbnail.setAttribute('data-video-id', LOCAL_VIDEO_ID);

    document.body.appendChild(thumbnail);
  });

  afterEach(function() {
    document.body.removeChild(thumbnail);
  });

  describe('The shoot function', function() {

    it('should return null if the attendee does not exist', function() {
      currentConferenceState.getAttendeeByVideoId = function() { return null; };

      expect(localCameraScreenshot.shoot()).to.equal(null);
    });

    it('should return null if the attendee has video muted', function() {
      currentConferenceState.getAttendeeByVideoId = function() { return { muteVideo: true}; };

      expect(localCameraScreenshot.shoot()).to.equal(null);
    });

    it('should return null if the thumbnail cannot be found', function() {
      thumbnail.setAttribute('data-video-id', 'notTheCorrectVideoId');
      currentConferenceState.getAttendeeByVideoId = function() { return { muteVideo: true}; };

      expect(localCameraScreenshot.shoot()).to.equal(null);
    });

    it('should use the given size', function() {
      currentConferenceState.getAttendeeByVideoId = function() { return {}; };

      expect(localCameraScreenshot.shoot(10)).to.deep.equal({
        src: 'data:10,10'
      });
    });

    it('should use the default size when not given', function() {
      currentConferenceState.getAttendeeByVideoId = function() { return {}; };

      expect(localCameraScreenshot.shoot()).to.deep.equal({
        src: 'data:' + DEFAULT_AVATAR_SIZE + ',' + DEFAULT_AVATAR_SIZE
      });
    });

    it('should use the thumbnail as the source of the image', function() {
      currentConferenceState.getAttendeeByVideoId = function() { return {}; };

      expect(localCameraScreenshot.shoot()).to.deep.equal({
        src: 'data:' + DEFAULT_AVATAR_SIZE + ',' + DEFAULT_AVATAR_SIZE
      });
    });

  });

});
