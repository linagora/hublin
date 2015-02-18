'use strict';

var expect = require('chai').expect,
    request = require('supertest'),
    apiHelpers = require('../../helpers/api-helpers.js');

describe('The conference API', function() {
  var creator, attendee, user, conferenceId;

  var application;

  before(function(done) {
    var self = this;
    this.testEnv.initCore(function() {
      var router = apiHelpers.getRouter('conferences');
      application = apiHelpers.getApplication(router);
      self.helpers.requireBackend('core/db/mongo/models/user');

      apiHelpers.applyDeployment('linagora_IT', self.testEnv, function(err, users) {
        if (err) { return done(err); }
        user = users[0];
        creator = users[1];
        attendee = users[2];
        var attendees = [attendee];

        apiHelpers.createConference(creator, attendees, function(err, conference) {
          if (err) { done(err);}

          conferenceId = conference._id + '';
          done();
        });
      });
    });
  });

  after(function(done) {
    this.mongoose.connection.db.dropDatabase();
    done();
  });

  describe('PUT /api/conferences/:id/attendees/:user_id', function() {
    it('should send back HTTP 401 when not logged in', function(done) {
      request(application).put('/api/conferences/' + conferenceId + '/attendees/' + user._id).expect(401).end(function(err) {
        expect(err).to.be.null;
        done();
      });
    });

    it('should send back HTTP 204 when connected user is conference admin', function(done) {
      apiHelpers.loginAsUser(application, creator.emails[0], 'secret', function(err, requestAsMember) {
        if (err) {
          return done(err);
        }
        var req = requestAsMember(request(application).put('/api/conferences/' + conferenceId + '/attendees/' + user._id));
        req.expect(204);
        req.end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.body).to.be.empty;
          done();
        });
      });
    });

    it('should send back HTTP 204 when connected user is conference attendee', function(done) {
      apiHelpers.loginAsUser(application, attendee.emails[0], 'secret', function(err, requestAsMember) {
        if (err) {
          return done(err);
        }
        var req = requestAsMember(request(application).put('/api/conferences/' + conferenceId + '/attendees/' + user._id));
        req.expect(204);
        req.end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.body).to.be.empty;
          done();
        });
      });
    });

    it('should send back HTTP 403 when connected user is not in the conference', function(done) {
      apiHelpers.loginAsUser(application, user.emails[0], 'secret', function(err, requestAsMember) {
        if (err) {
          return done(err);
        }
        var req = requestAsMember(request(application).put('/api/conferences/' + conferenceId + '/attendees/' + user._id));
        req.expect(403);
        done();
      });
    });

  });

});
