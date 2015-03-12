'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var rewire = require('rewire');
var logger = require('../../../fixtures/logger-noop');
var extend = require('extend');

describe('The conferences controller', function() {
  var dependencies;

  before(function() {
    dependencies = function(name) {
      if (name === 'logger') {
        return logger();
      }
    };

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
      mockery.registerMock('../../core/conference', {});
      this.helpers.mock.models({});
      var conference = {_id: 'MyConference', members: []};
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = {
        json: function(status, body) {
          expect(status).to.equal(201, body);
          expect(body).to.deep.equal(conference.toObject());
          done();
        }
      };
      controller.finalizeCreation({
        created: true,
        user: {displayName: 'foobar'},
        conference: this.addToObject(conference),
        body: {}
      },res);
    });

    it('should send back 200 with conference when already created', function(done) {
      mockery.registerMock('../../core/conference', {});
      this.helpers.mock.models({});
      var conference = {_id: 'MyConference', members: []};
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = {
        json: function(status, body) {
          expect(status).to.equal(200, body);
          expect(body).to.deep.equal(conference.toObject());
          done();
        }
      };
      controller.finalizeCreation({
        created: false,
        user: {displayName: 'foobar'},
        conference: this.addToObject(conference),
        body: {}
      },res);
    });

    it('should send back 202 when members are invited', function(done) {
      var membersToInvite = [{id: 'yo@hubl.in', objectType: 'email', displayName: 'yo@hubl.in'}];
      mockery.registerMock('../../core/conference', {
        invite: function(conference, user, members, callback) {
          expect(members).to.deep.equals(membersToInvite);
          return callback();
        }
      });
      this.helpers.mock.models({});
      var conference = {_id: 'MyConference', members: []};
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = {
        send: function(status) {
          expect(status).to.equal(202);
          done();
        }
      };
      controller.finalizeCreation({
        created: true,
        user: {displayName: 'foobar'},
        conference: this.addToObject(conference),
        body: {members: membersToInvite}
      }, res);
    });

    it('should send back 400 when members can not be invited due to bad request', function(done) {
      mockery.registerMock('../../core/conference', {
        invite: function(conference, user, members, callback) {
          return callback(new Error());
        }
      });
      this.helpers.mock.models({});
      var conference = {_id: 'MyConference', members: []};
      var rewired = rewire('../../../../backend/webserver/controllers/conferences');
      rewired.__set__('inviteMembers', function(conference, user, members, callback) {
        var err = new Error('');
        err.code = 1;
        return callback(err);
      });
      var controller = rewired(dependencies);

      var res = {
        json: function(status) {
          expect(status).to.equal(400);
          done();
        }
      };
      controller.finalizeCreation({created: true, user: {displayName: 'foobar'}, conference: conference, body: {members: [{id: 'yo@hubl.in', objectType: 'email'}]}}, res);
    });

    it('should send back 500 when members can not be invited due to server error', function(done) {
      mockery.registerMock('../../core/conference', {
        invite: function(conference, user, members, callback) {
          return callback(new Error());
        }
      });
      this.helpers.mock.models({});
      var conference = {_id: 'MyConference', members: []};
      var rewired = rewire('../../../../backend/webserver/controllers/conferences');
      rewired.__set__('inviteMembers', function(conference, user, members, callback) {
        var err = new Error('');
        return callback(err);
      });
      var controller = rewired(dependencies);
      var res = {
        json: function(status) {
          expect(status).to.equal(500);
          done();
        }
      };
      controller.finalizeCreation({created: true, user: {displayName: 'foobar'}, conference: conference, body: {members: [{id: 'yo@hubl.in', objectType: 'email'}]}}, res);
    });
  });

  describe('getMembers function', function() {
    it('should send back HTTP 400 when conference is not defined in req', function(done) {
      mockery.registerMock('../../core/conference', {});
      mockery.registerMock('../../core/report', {});
      var controller = this.helpers.requireBackend('webserver/controllers/conferences')(dependencies);
      var res = this.helpers.httpStatusCodeValidatingJsonResponse(400, function(data) {
        expect(data.error).to.exist;
        done();
      });
      controller.getMembers({user: {}}, res);
    });

    it('should send back HTTP 200 with empty array if conference has undefined members', function(done) {
      mockery.registerMock('../../core/conference', {});
      mockery.registerMock('../../core/report', {});
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
      mockery.registerMock('../../core/report', {});
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
      var res = this.helpers.httpStatusCodeValidatingJsonResponse(200, function(users) {
        expect(users).to.deep.equal(sanitizedMembers);
        done();
      });
      var req = {
        conference: this.addToObject({
          members: members
        })
      };
      controller.getMembers(req, res);
    });
  });
});
