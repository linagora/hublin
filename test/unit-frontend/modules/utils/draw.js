'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The draw factory collection', function() {

  beforeEach(angular.mock.module('op.live-conference'));

  describe('The drawHelper function', function() {

    var drawHelper;

    beforeEach(function() {
      inject(function($injector) {
        drawHelper = $injector.get('drawHelper');
      });
    });

    it('should call context.drawImage with all parameter except the first one and "this" to be the first parameter', function(done) {
      var arg1Expected = 'arg1';
      var arg2Expected = 'arg2';
      var arg3Expected = 'arg3';
      var context = {
        drawImage: drawImage
      };

      drawHelper.drawImage(context, arg1Expected, arg2Expected, arg3Expected);

      function drawImage(arg1, arg2, arg3, arg4) {
        expect(this).to.deep.equal(context);
        expect(arg1).to.deep.equal(arg1Expected);
        expect(arg2).to.deep.equal(arg2Expected);
        expect(arg3).to.deep.equal(arg3Expected);
        expect(arg4).to.be.undefined;
        done();
      }
    });
  });

  describe('The drawAvatarIfVideoMuted function', function() {

    var currentConferenceState, drawAvatarIfVideoMuted, getCoordinatesOfCenteredImage, attendeeColorsService, getCoordinatesOfCenteredImageMock;

    beforeEach(function() {
      getCoordinatesOfCenteredImageMock = {};
      currentConferenceState = {};
      getCoordinatesOfCenteredImage = function() { return getCoordinatesOfCenteredImageMock; };
      attendeeColorsService = {
        getColorForAttendeeAtIndex: function() { return 'color'; }
      };

      module(function($provide) {
        $provide.value('currentConferenceState', currentConferenceState);
        $provide.value('getCoordinatesOfCenteredImage', getCoordinatesOfCenteredImage);
        $provide.value('attendeeColorsService', attendeeColorsService);
      });

      inject(function($injector) {
        drawAvatarIfVideoMuted = $injector.get('drawAvatarIfVideoMuted');
      });
    });

    it('should do nothing if the attendee cannot be found', function() {
      currentConferenceState.getAttendeeByVideoId = function() { return null; };
      currentConferenceState.getAvatarImageByIndex = function() { throw new Error('This test should not call currentConferenceState.getAvatarImageByIndex'); };

      drawAvatarIfVideoMuted('videoId', null, null, null, function() {
        throw new Error('This test should not call the otherwise function');
      });
    });

    it('should call the otherwise function if attendee is not video muted', function(done) {
      currentConferenceState.getAttendeeByVideoId = function() { return { muteVideo: false }; };
      currentConferenceState.getAvatarImageByIndex = function() { done(new Error('This test should not call currentConferenceState.getAvatarImageByIndex')); };

      drawAvatarIfVideoMuted('videoId', { canvas: {} }, null, null, function() {
        done();
      });
    });

    it('should do nothing if the attendee avatar cannot be loaded', function() {
      currentConferenceState.getAttendeeByVideoId = function() { return { muteVideo: true }; };
      currentConferenceState.getAvatarImageByIndex = function(index, callback) { callback(new Error('WTF')); };

      drawAvatarIfVideoMuted('videoId', {
        canvas: {},
        clearRect: function() {
          throw new Error('This test should not call context.clearRect');
        }
      }, null, null, function() {
        throw new Error('This test should not call the otherwise function');
      });
    });

    it('should do nothing if the attendee avatar has no size', function() {
      currentConferenceState.getAttendeeByVideoId = function() { return { muteVideo: true }; };
      currentConferenceState.getAvatarImageByIndex = function(index, callback) { callback(null, new Image()); };

      drawAvatarIfVideoMuted('videoId', {
        canvas: {},
        clearRect: function() {
          throw new Error('This test should not call context.clearRect');
        }
      }, null, null, function() {
        throw new Error('This test should not call the otherwise function');
      });
    });

    it('should draw the avatar, centered and fitted', function() {
      var context = {
        canvas: {},
        called: [],
        fillStyle: '',
        clearRect: function(x, y, width, height) {
          expect(x).to.equal(0);
          expect(y).to.equal(0);
          expect(width).to.equal(400);
          expect(height).to.equal(400);

          this.called.push('clearRect');
        },
        fillRect: function(x, y, width, height) {
          expect(x).to.equal(100);
          expect(y).to.equal(100);
          expect(width).to.equal(200);
          expect(height).to.equal(200);

          this.called.push('fillRect');
        },
        drawImage: function(image, x, y, width, height) {
          expect(x).to.equal(100);
          expect(y).to.equal(100);
          expect(width).to.equal(200);
          expect(height).to.equal(200);

          this.called.push('drawImage');
        }
      };

      currentConferenceState.getAttendeeByVideoId = function() { return { muteVideo: true }; };
      currentConferenceState.getAvatarImageByIndex = function(index, callback) { callback(null, { width: 200 }); };
      getCoordinatesOfCenteredImageMock = {
        x: 100,
        y: 100,
        size: 200
      };

      drawAvatarIfVideoMuted('videoId', context, 400, 400, function() {
        throw new Error('This test should not call the otherwise function');
      });

      expect(context.fillStyle).to.equal('color');
      expect(context.called).to.deep.equal(['clearRect', 'fillRect', 'drawImage']);
    });

    it('should not redraw the avatar if attendee muteVideo property did not change', function() {
      var context = {
        canvas: {},
        called: [],
        clearRect: function() {
          this.called.push('clearRect');
        },
        fillRect: function() {
          this.called.push('fillRect');
        },
        drawImage: function() {
          this.called.push('drawImage');
        }
      };

      currentConferenceState.getAttendeeByVideoId = function() { return { muteVideo: true }; };
      currentConferenceState.getAvatarImageByIndex = function(index, callback) { callback(null, { width: 200 }); };
      getCoordinatesOfCenteredImageMock = {
        x: 100,
        y: 100,
        size: 200
      };

      drawAvatarIfVideoMuted('videoId', context, 400, 400, function() {
        throw new Error('This test should not call the otherwise function');
      });
      drawAvatarIfVideoMuted('videoId', context, 400, 400, function() {
        throw new Error('This test should not call the otherwise function');
      });

      expect(context.called).to.deep.equal(['clearRect', 'fillRect', 'drawImage']);
    });

  });

  describe('The getCoordinatesOfCenteredImage function', function() {

    var getCoordinatesOfCenteredImage;

    beforeEach(function() {
      inject(function($injector) {
        getCoordinatesOfCenteredImage = $injector.get('getCoordinatesOfCenteredImage');
      });
    });

    it('should not scale the child up when parent is larger', function() {
      expect(getCoordinatesOfCenteredImage(1000, 1000, 200).size).to.equal(200);
    });

    it('should center the child when the parent is larger', function() {
      expect(getCoordinatesOfCenteredImage(1000, 1000, 200)).to.deep.equal({
        x: 400,
        y: 400,
        size: 200
      });
    });

    it('should scale the child down when the parent is smaller', function() {
      expect(getCoordinatesOfCenteredImage(100, 100, 200)).to.deep.equal({
        x: 0,
        y: 0,
        size: 100
      });
    });

    it('should consider the width of the parent to scale the child down when the parent is portrait', function() {
      expect(getCoordinatesOfCenteredImage(100, 500, 200)).to.deep.equal({
        x: 0,
        y: 200,
        size: 100
      });
    });

    it('should consider the height of the parent to scale the child down when the parent is landscape', function() {
      expect(getCoordinatesOfCenteredImage(500, 150, 300)).to.deep.equal({
        x: 175,
        y: 0,
        size: 150
      });
    });

    it('should use the whole parent when child has the same size', function() {
      expect(getCoordinatesOfCenteredImage(200, 200, 200)).to.deep.equal({
        x: 0,
        y: 0,
        size: 200
      });
    });

  });

});
