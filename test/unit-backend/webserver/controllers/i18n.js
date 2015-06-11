'use strict';

var expect = require('chai').expect;

describe('The i18n controller', function() {
  var errors, controller, dependencies = function() { return errors; };

  beforeEach(function() {
    errors = this.helpers.requireBackend('webserver/errors')(dependencies);
    controller = this.helpers.requireBackend('webserver/controllers/i18n')(dependencies);
  });

  describe('The getCatalog function', function() {

    it('should use the given query parameter as the locale if present', function(done) {
      expect(function() {
        controller.getCatalog({
          query: {
            locale: 'zz'
          },
          getLocale: function() { return 'fr'; },
          getCatalog: function(query) {
            done(query === 'zz' ? null : 'Expected zz as the locale !');
          }
        }, {});
      }).to.throw(errors.NotFoundError);
    });

    it('should use the request locale if query parameter is absent', function(done) {
      expect(function() {
        controller.getCatalog({
          query: {},
          getLocale: function() { return 'fr'; },
          getCatalog: function(query) {
            done(query === 'fr' ? null : 'Expected fr as the locale !');
          }
        }, {});
      }).to.throw(errors.NotFoundError);
    });

    it('should send a NotFoundError if the locale does not exist', function() {
      expect(function() {
        controller.getCatalog({
          query: {
            locale: 'zz'
          },
          getCatalog: function() { return false; }
        }, {});
      }).to.throw(errors.NotFoundError);
    });

    it('should send the catalog as UTF-8 JSON when found', function(done) {
      controller.getCatalog({
        query: {
          locale: 'zz'
        },
        getCatalog: function() { return { a: 'b' }; }
      }, {
        header: function(header, value) {
          expect(header).to.equal('Content-Type');
          expect(value).to.equal('application/json; charset=utf-8');
        },
        json: function(code, data) {
          expect(code).to.equal(200);
          expect(data).to.deep.equal({ a: 'b' });

          done();
        }
      });
    });

  });

});
