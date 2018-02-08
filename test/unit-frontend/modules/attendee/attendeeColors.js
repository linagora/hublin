'use strict';

/* global chai: false */

var expect = chai.expect;

describe('attendeeColors service', function() {
  var service, MAX_ATTENDEES;

  beforeEach(angular.mock.module('op.live-conference'));

  beforeEach(function() {
    inject(function($injector) {
      service = $injector.get('attendeeColorsService');
      MAX_ATTENDEES = $injector.get('MAX_ATTENDEES');
    });
  });

  describe('getColorForAttendeeAtIndex function', function() {

    it('should return up to MAX_ATTENDEES different colors', function() {
      var colors = [];

      for (var i = 0; i < MAX_ATTENDEES; i++) {
        colors.push(service.getColorForAttendeeAtIndex(i));
      }

      expect(colors).to.have.length(MAX_ATTENDEES);
    });

    it('should be tolerant to indices > MAX_ATTENDEES, and rotate', function() {
      expect(service.getColorForAttendeeAtIndex(MAX_ATTENDEES + 2)).to.equal(service.getColorForAttendeeAtIndex(2));
    });

  });

});
