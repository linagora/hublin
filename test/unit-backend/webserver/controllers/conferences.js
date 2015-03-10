'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var logger = require('../../../fixtures/logger-noop');

describe('The conferences controller', function() {
  var dependencies;

  before(function() {
    dependencies = function(name) {
      if (name === 'logger') {
        return logger();
      }
    };
  });

  it('createAPI should send back HTTP 500 when conference sends back error', function(done) {
    mockery.registerMock('../../core/conference', {
      create: function(user, callback) {
        return callback(new Error());
      }
    });
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(500);
        done();
      }
    };
    controller.createAPI({user: {displayName: 'foobar'}, params: {id: 123}, body: {}, headers: [], query: []}, res);
  });

  it('createAPI should send back HTTP 201 when conference creates resource', function(done) {
    mockery.registerMock('../../core/conference', {
      create: function(user, callback) {
        return callback(null, {
          members: []
        });
      }
    });
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(code) {
        expect(code).to.equal(201);
        done();
      }
    };
    controller.createAPI({user: {displayName: 'foobar'}, params: {id: 123}, body: {}, headers: [], query: []}, res);
  });

  describe('getMembers function', function() {
    it('should send back HTTP 400 when conference is not defined in req', function(done) {
      mockery.registerMock('../../core/conference', {});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = this.helpers.httpStatusCodeValidatingJsonResponse(400, function(data) {
        expect(data.error).to.exist;
        done();
      });
      controller.getMembers({user: {}}, res);
    });

    it('should send back HTTP 200 with empty array if conference has undefined members', function(done) {
      mockery.registerMock('../../core/conference', {});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = this.helpers.httpStatusCodeValidatingJsonResponse(200, function(data) {
        expect(data).to.deep.equal([]);
        done();
      });
      var req = {
        conference: {}
      };
      controller.getMembers(req, res);
    });

    it('should send back HTTP 200 with empty array if conference has empty members', function(done) {
      mockery.registerMock('../../core/conference', {});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = this.helpers.httpStatusCodeValidatingJsonResponse(200, function(data) {
        expect(data).to.deep.equal([]);
        done();
      });
      var req = {
        conference: {
          attendees: []
        }
      };
      controller.getMembers(req, res);
    });

    it('should send back HTTP 200 with members array', function(done) {
      mockery.registerMock('../../core/conference', {});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var members = [
        {id: 'user1', objcetType: 'ot1'},
        {id: 'user2', objcetType: 'ot2'}
      ];
      var res = this.helpers.httpStatusCodeValidatingJsonResponse(200, function(users) {
        expect(users).to.deep.equal(members);
        done();
      });
      var req = {
        conference: {
          members: members
        }
      };
      controller.getMembers(req, res);
    });
  });
});
