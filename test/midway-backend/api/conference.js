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
    it('should send back HTTP 204 if all went ok', function(done) {
      request(application)
        .put('/api/conferences/' + conferenceId + '/attendees/' + user._id)
        .expect(204)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.body).to.be.empty;
          done();
        });
    });
  });

});
