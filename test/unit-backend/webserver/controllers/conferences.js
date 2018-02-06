'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var logger = require('../../../fixtures/logger-noop');
var extend = require('extend');
const sinon = require('sinon');

describe('The conferences controller', function() {
  var dependencies, errors;

  before(function() {
    dependencies = function(name) {
      if (name === 'logger') {
        return logger();
      }
    };

    errors = this.helpers.requireBackend('webserver/errors')(dependencies);

    this.addToObject = function(obj) {
      var vanilla = extend(true, {}, obj);
      obj.toObject = function() {
        return vanilla;
      };
      return obj;
    };
  });

  describe('finalizeCreation function', function() {

    it('should send back 201 with conference when created', function(done) {
      const configSpy = sinon.spy(() => ({
        get: function(callback) {
          callback();
        }
      }));

      mockery.registerMock('../../core/conference', {});
      mockery.registerMock('../../core/esn-config', configSpy);
      this.helpers.mock.models({});
      var conference = {_id: 'MyConference', members: []};
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = this.helpers.express.jsonResponse(
        function(status, body) {
          expect(status).to.equal(201, body);
          expect(body).to.deep.equal(conference.toObject());
          expect(configSpy).to.have.been.calledWith('iceservers');
          done();
        }
      );
      controller.finalizeCreation({
        created: true,
        user: {displayName: 'foobar'},
        conference: this.addToObject(conference),
        body: {}
      }, res);
    });

    it('should add ice configuration 201 with conference when created', function(done) {
      const iceConfiguration = ['foo', 'bar'];
      const configSpy = sinon.spy(() => ({
        get: function(callback) {
          callback(null, { servers: iceConfiguration });
        }
      }));

      mockery.registerMock('../../core/conference', {});
      mockery.registerMock('../../core/esn-config', configSpy);
      this.helpers.mock.models({});
      var conference = {_id: 'MyConference', members: []};
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = this.helpers.express.jsonResponse(
        function(status, body) {
          expect(status).to.equal(201, body);
          expect(body.iceServers).to.deep.equal(iceConfiguration);
          expect(configSpy).to.have.been.calledWith('iceservers');
          done();
        }
      );
      controller.finalizeCreation({
        created: true,
        user: {displayName: 'foobar'},
        conference: this.addToObject(conference),
        body: {}
      }, res);
    });

    it('should send back 200 with conference when already created', function(done) {
      const configSpy = sinon.spy(() => ({
        get: function(callback) {
          callback();
        }
      }));

      mockery.registerMock('../../core/conference', {});
      mockery.registerMock('../../core/esn-config', configSpy);

      this.helpers.mock.models({});
      var conference = {_id: 'MyConference', members: []};
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = this.helpers.express.jsonResponse(
        function(status, body) {
          expect(status).to.equal(200, body);
          expect(body).to.deep.equal(conference.toObject());
          done();
        }
      );
      controller.finalizeCreation({
        created: false,
        user: {displayName: 'foobar'},
        conference: this.addToObject(conference),
        body: {}
      }, res);
    });

    it('should send back 202 when members are invited', function(done) {
      const configSpy = sinon.spy(() => ({
        get: function(callback) {
          callback();
        }
      }));

      mockery.registerMock('../../core/conference', {});
      mockery.registerMock('../../core/esn-config', configSpy);

      var membersToInvite = [{id: 'yo@hubl.in', objectType: 'email', displayName: 'yo@hubl.in'}];
      mockery.registerMock('../../core/conference', {
        invite: function(conference, user, members, baseUrl, callback) {
          expect(members).to.deep.equals(membersToInvite);
          return callback();
        }
      });
      this.helpers.mock.models({});
      var conference = {_id: 'MyConference', members: []};
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = this.helpers.express.response(
        function(status) {
          expect(status).to.equal(202);
          done();
        }
      );
      controller.finalizeCreation({
        created: true,
        user: {displayName: 'foobar'},
        conference: this.addToObject(conference),
        body: {members: membersToInvite},
        openpaas: {
          getBaseURL: function() {
            return 'https://hubl.out';
          }
        }
      }, res);
    });

    it('should send back 400 when members can not be invited due to bad request', function(done) {
      const configSpy = sinon.spy(() => ({
        get: function(callback) {
          callback();
        }
      }));

      mockery.registerMock('../../core/conference', {
        invite: function(conference, user, members, callback) {
          return callback(new Error());
        }
      });
      mockery.registerMock('../../core/esn-config', configSpy);

      this.helpers.mock.models({});
      var conference = this.addToObject({_id: 'MyConference', members: []});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);

      this.helpers.expectHttpError(errors.BadRequestError, function(res) {
        controller.finalizeCreation({
          created: true,
          user: {displayName: 'foobar'},
          conference: conference,
          body: {members: 'hahaha'},
          openpaas: {
            getBaseURL: function() {
              return 'https://hubl.out';
            }
          }
        }, res);
      }, done);
    });

    it('should send back 500 when members can not be invited due to server error', function(done) {
      const configSpy = sinon.spy(() => ({
        get: function(callback) {
          callback();
        }
      }));

      mockery.registerMock('../../core/esn-config', configSpy);
      mockery.registerMock('../../core/conference', {
        invite: function(conference, user, members, baseUrl, callback) {
          return callback(new Error());
        }
      });
      this.helpers.mock.models({});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      this.helpers.expectHttpError(errors.ServerError, function(res) {
        controller.finalizeCreation({
          created: true,
          user: {displayName: 'foobar'},
          conference: null,
          body: {members: [{id: 'yo@hubl.in', objectType: 'email'}]},
          openpaas: {
            getBaseURL: function() {
              return 'https://hubl.out';
            }
          }
        }, res);
      }, done);
    });
  });

  describe('getMembers function', function() {
    it('should send back HTTP 400 when conference is not defined in req', function(done) {
      mockery.registerMock('../../core/conference', {});
      mockery.registerMock('../../core/report', {});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      this.helpers.expectHttpError(errors.BadRequestError, function(res) {
        controller.getMembers({user: {}}, res);
      }, done);
    });

    it('should send back HTTP 200 with empty array if conference has undefined members', function(done) {
      mockery.registerMock('../../core/conference', {});
      mockery.registerMock('../../core/report', {});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = this.helpers.express.jsonResponse(
        function(status, data) {
          expect(status).to.equal(200);
          expect(data).to.deep.equal([]);
          done();
        }
      );
      var req = {
        conference: {}
      };
      controller.getMembers(req, res);
    });

    it('should send back HTTP 200 with empty array if conference has empty members', function(done) {
      mockery.registerMock('../../core/conference', {});
      mockery.registerMock('../../core/report', {});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = this.helpers.express.jsonResponse(
        function(status, data) {
          expect(status).to.equal(200);
          expect(data).to.deep.equal([]);
          done();
        }
      );
      var req = {
        conference: {
          attendees: []
        }
      };
      controller.getMembers(req, res);
    });

    it('should send back HTTP 200 with members array', function(done) {
      mockery.registerMock('../../core/conference', {});
      mockery.registerMock('../../core/report', {});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var members = [
        {id: 'user1', objectType: 'ot1', _id: 'id1', status: 'offline', token: 'token1', displayName: 'display1'},
        {id: 'user2', objectType: 'ot2', _id: 'id2', status: 'offline2', token: 'token2', displayName: 'display2'}
      ];

      var sanitizedMembers = [
        {objectType: 'ot1', _id: 'id1', status: 'offline', displayName: 'display1'},
        {objectType: 'ot2', _id: 'id2', status: 'offline2', displayName: 'display2'}
      ];
      var res = this.helpers.express.jsonResponse(
        function(status, users) {
          expect(status).to.equal(200);
          expect(users).to.deep.equal(sanitizedMembers);
          done();
        }
      );
      var req = {
        conference: this.addToObject({
          members: members
        })
      };
      controller.getMembers(req, res);
    });
  });

  describe('updateMemberField function', function() {
    it('should update req.user when on successful field update', function(done) {
      var name = 'Bruce Lee';
      var field = 'displayName';
      var mid = 'id1';

      var _id = {
        toString: function() {
          return mid;
        }
      };

      mockery.registerMock('../../core/conference', {
        updateMemberField: function(conf, member, field, value, callback) {
          return callback();
        }
      });
      mockery.registerMock('../../core/report', {});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var members = [
        this.addToObject({id: 'user1', objectType: 'ot1', _id: _id, status: 'offline', token: 'token1', displayName: 'display1'})
      ];

      var req = {
        conference: this.addToObject({
          members: members
        }),
        body: {
          value: name
        },
        params: {
          field: field,
          mid: mid
        },
        user: members[0]
      };

      var res = this.helpers.express.jsonResponse(
        function() {
          expect(req.user[field]).to.equal(name);
          done();
        }
      );
      controller.updateMemberField(req, res);
    });
  });
});
