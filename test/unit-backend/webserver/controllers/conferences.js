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

  it('redirect when conference is in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var req = {
      conference: {
        creator: 123
      }
    };
    var res = {
      redirect: function() {
        done();
      }
    };
    controller.get(req, res);
  });

  it('create should send back HTTP 500 when conference sends back error', function(done) {
    mockery.registerMock('../../core/conference', {
      create: function(user, callback) {
        return callback(new Error());
      }
    });
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      send: function(status) {
        expect(status).to.equal(500);
        done();
      }
    };
    controller.create({user: {displayName: 'foobar'}, params: {id: 123}, body: {}, headers: [], query: []}, res);
  });

  it('create should redirect to /:name', function(done) {
    mockery.registerMock('../../core/conference', {
      create: function(user, callback) {
        return callback(null, {id: 'name'});
      }
    });
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      redirect: function(path) {
        expect(path).to.equals('/name');
        done();
      }
    };
    controller.create({user: {displayName: 'foobar'}, params: {id: 123}, body: {}, headers: [], query: []}, res);
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
        return callback(null, {});
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

  it('getAttendees should send back HTTP 400 when conference is not defined in req', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(400);
        done();
      }
    };
    controller.getAttendees({user: {}}, res);
  });

  it('getAttendees should send back HTTP 200 with empty array if conference has undefined attendees', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(200);
        done();
      }
    };
    var req = {
      conference: {}
    };
    controller.getAttendees(req, res);
  });

  it('getAttendees should send back HTTP 200 with empty array if conference has empty attendees', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(200);
        done();
      }
    };
    var req = {
      conference: {
        attendees: []
      }
    };
    controller.getAttendees(req, res);
  });

  it('getAttendees should send back HTTP 200 with attendees array', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status, users) {
        expect(status).to.equal(200);
        expect(users).to.exist;
        expect(users.length).to.equal(2);

        done();
      }
    };
    var req = {
      conference: {
        attendees: [
          {user: {toObject: function() { return {_id: 1};}}},
          {user: {toObject: function() { return {_id: 2};}}}
        ]
      }
    };
    controller.getAttendees(req, res);
  });
});
