'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');

describe('The conferences controller', function() {
  var dependencies;

  before(function() {
    dependencies = {};
  });

  it('get should send back HTTP 200 when conference is in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var req = {
      conference: {
        creator: 123
      }
    };
    var res = {
      json: function(status) {
        expect(status).to.equal(200);
        done();
      }
    };
    controller.get(req, res);
  });

  it('get should send back HTTP 400 when conference is not in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(400);
        done();
      }
    };
    controller.get({}, res);
  });

  it('list should send back HTTP 500 when conference sends back error', function(done) {
    mockery.registerMock('../../core/conference', {
      list: function(callback) {
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
    controller.list({}, res);
  });

  it('list should send back HTTP 200 when conference sends back list', function(done) {
    mockery.registerMock('../../core/conference', {
      list: function(callback) {
        return callback(null, []);
      }
    });
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(200);
        done();
      }
    };
    controller.list({}, res);
  });

  it('create should send back HTTP 400 when user is not defined in req', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(400);
        done();
      }
    };
    controller.create({}, res);
  });

  it('create should send back HTTP 500 when conference sends back error', function(done) {
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
    controller.create({user: {_id: 123}}, res);
  });

  it('create should send back HTTP 201 when conference creates resource', function(done) {
    mockery.registerMock('../../core/conference', {
      create: function(user, callback) {
        return callback(null, {});
      }
    });
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(201);
        done();
      }
    };
    controller.create({user: {_id: 123}}, res);
  });

  it('join should send back HTTP 400 when user is not defined in req', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(400);
        done();
      }
    };
    controller.join({conference: {}}, res);
  });

  it('join should send back HTTP 400 when conference is not defined in req', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(400);
        done();
      }
    };
    controller.join({user: {}}, res);
  });

  it('join should send back HTTP 500 when conference sends back error', function(done) {
    mockery.registerMock('../../core/conference', {
      join: function(conf, user, callback) {
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
    controller.join({user: {}, conference: {}}, res);
  });

  it('join should send back HTTP 204 when conference creates resource', function(done) {
    mockery.registerMock('../../core/conference', {
      join: function(conf, user, callback) {
        return callback(null, {});
      }
    });
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(204);
        done();
      }
    };
    controller.join({user: {}, conference: {}}, res);
  });

  it.skip('leave should send back HTTP 400 when user is not defined in req', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(400);
        done();
      }
    };
    controller.leave({conference: {}}, res);
  });

  it.skip('leave should send back HTTP 400 when conference is not defined in req', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(400);
        done();
      }
    };
    controller.leave({user: {}}, res);
  });

  it.skip('leave should send back HTTP 500 when conference sends back error', function(done) {
    mockery.registerMock('../../core/conference', {
      leave: function(conf, user, callback) {
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
    controller.leave({user: {}, conference: {}}, res);
  });

  it.skip('leave should send back HTTP 204 when conference creates resource', function(done) {
    mockery.registerMock('../../core/conference', {
      leave: function(conf, user, callback) {
        return callback(null, {});
      }
    });
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status) {
        expect(status).to.equal(204);
        done();
      }
    };
    controller.leave({user: {}, conference: {}}, res);
  });

  it('updateAttendee should send HTTP 400 when action is not defined', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status, error) {
        expect(status).to.equal(400);
        expect(error).to.exist;
        expect(error.error.details).to.match(/Action is missing/);
        done();
      }
    };
    var req = {
      user: {},
      conference: {},
      param: function() {
        return null;
      }
    };
    controller.updateAttendee(req, res);
  });

  it('updateAttendee should send HTTP 400 when action is unknown', function(done) {
    mockery.registerMock('../../core/conference', {});
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
      json: function(status, error) {
        expect(status).to.equal(400);
        expect(error).to.exist;
        expect(error.error.details).to.match(/Unknown action/);
        done();
      }
    };
    var req = {
      user: {},
      conference: {},
      param: function() {
        return 'awrongaction';
      }
    };
    controller.updateAttendee(req, res);
  });

  it('updateAttendee should call join when action=join', function(done) {
    mockery.registerMock('../../core/conference', {
      join: function() {
        done();
      }
    });
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
    };
    var req = {
      user: {},
      conference: {},
      param: function() {
        return 'join';
      }
    };
    controller.updateAttendee(req, res);
  });

  it.skip('updateAttendee should call leave when action=leave', function(done) {
    mockery.registerMock('../../core/conference', {
      leave: function() {
        done();
      }
    });
    var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
    var res = {
    };
    var req = {
      user: {},
      conference: {},
      param: function() {
        return 'leave';
      }
    };
    controller.updateAttendee(req, res);
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
