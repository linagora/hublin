'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The hubI18nInterpolator service', function() {
  var hubI18nInterpolator;

  beforeEach(function() {
    angular.mock.module('hublin.i18n');
  });

  beforeEach(inject(function(_hubI18nInterpolator_) {
    hubI18nInterpolator = _hubI18nInterpolator_;
  }));

  describe('The interpolate function', function() {
    it('should replace string that contains a variable', function() {
      var result = hubI18nInterpolator.interpolate('Hello %s!', ['world']);

      expect(result).to.equal('Hello world!');
    });

    it('should replace string that contains multiple variables', function() {
      var result = hubI18nInterpolator.interpolate('Greetings from %s %s', ['Hanoi', 'Linagorians']);

      expect(result).to.equal('Greetings from Hanoi Linagorians');
    });
  });
});
