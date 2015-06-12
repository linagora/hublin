'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The meetings.i18n module', function() {

  beforeEach(function() {
    module('meetings.i18n');
  });

  describe('The i18nService service', function() {

    var httpBackend, i18nService;

    beforeEach(inject(function(_$httpBackend_, _i18nService_) {
      httpBackend = _$httpBackend_;
      i18nService = _i18nService_;
    }));

    describe('The __ function', function() {

      it('should return the key if the catalog does not contain the key', function(done) {
        httpBackend.expectGET('/i18n/').respond({
          data: {
            a: 'b'
          }
        });

        i18nService.__('myKey').then(function(text) {
          expect(text).to.equal('myKey');

          done();
        });

        httpBackend.flush();
      });

      it('should return the translation if the catalog contains the key', function(done) {
        httpBackend.expectGET('/i18n/').respond({
          data: {
            myKey: 'myTranslation'
          }
        });

        i18nService.__('myKey').then(function(text) {
          expect(text).to.equal('myTranslation');

          done();
        });

        httpBackend.flush();
      });

      it('should return the key if the catalog could not be fetched', function(done) {
        httpBackend.expectGET('/i18n/').respond(500);

        i18nService.__('myKey').then(function(text) {
          expect(text).to.equal('myKey');

          done();
        });

        httpBackend.flush();
      });

      it('should request the given locale if specified', function(done) {
        httpBackend.expectGET('/i18n/?locale=fr').respond({
          data: {
            'myKey': 'maTraduction'
          }
        });

        i18nService.__('myKey', 'fr').then(function(text) {
          expect(text).to.equal('maTraduction');

          done();
        });

        httpBackend.flush();
      });

    });

    describe('The getCatalog function', function() {

      it('should return the full catalog', function(done) {
        httpBackend.expectGET('/i18n/').respond({
          data: {
            a: 'b',
            c: 'd'
          }
        });

        i18nService.getCatalog().then(function(catalog) {
          expect(catalog).to.deep.equal({
            a: 'b',
            c: 'd'
          });

          done();
        });

        httpBackend.flush();
      });

      it('should request the given locale if specified', function(done) {
        httpBackend.expectGET('/i18n/?locale=fr').respond({
          data: {}
        });

        i18nService.getCatalog('fr').then(function() {
          done();
        });

        httpBackend.flush();
      });

    });
  });

});
