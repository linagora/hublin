'use strict';

var expect = require('chai').expect,
    request = require('supertest'),
    apiHelpers = require('../../helpers/api-helpers.js');

describe('The conference API', function() {
  var creator, attendee, conferenceId;

  var application;
  var deps = {
    logger: require('../fixtures/logger-noop')()
  };
  var dependencies = function(name) {
    return deps[name];
  };

  beforeEach(function(done) {
    this.testEnv.initCore(function() {
      var router = apiHelpers.getRouter('conferences', dependencies);
      application = apiHelpers.getApplication(router);
      done();
    });
  });

  afterEach(function() {
    this.mongoose.connection.db.dropDatabase();
  });

  describe.skip('GET /api/conferences/:id', function() {
    it('should send back 404 if the conference is not found', function(done) {
      request(application)
        .get('/api/conferences/54e5e86e65806d7c16764b79')
        .expect(404)
        .end(done);
    });

    it('should send back 500 if there is a server error', function(done) {
      request(application)
        .get('/api/conferences/123456')
        .expect(500)
        .end(done);
    });

    it('should send back 200 with the conference if it is found', function(done) {
      request(application)
        .get('/api/conferences/' + conferenceId)
        .expect(200)
        .end(function(err, res) {
          expect(err).to.not.exist;
          delete res.body.timestamps.creation;
          expect(res.body).to.deep.equal(
            {
              '__v': 0,
              '_id': conferenceId,
              'attendees': [
                {
                  'status': 'online',
                  'user': attendee._id.toString()
                }
              ],
              'creator': creator._id.toString(),
              'history': [],
              'schemaVersion': 1,
              'timestamps': {}
            });
          done();
        });
    });
  });

  describe.skip('GET /api/conferences', function() {
    it('should send back 200 with the conference if it is found', function(done) {
      request(application)
        .get('/api/conferences')
        .expect(200)
        .end(function(err, res) {
          expect(err).to.not.exist;
          delete res.body[0].timestamps.creation;
          delete res.body[0].creator.timestamps.creation;

          expect(res.body).to.deep.equal([
            {
              '__v': 0,
              '_id': conferenceId,
              'attendees': [
                {
                  'status': 'online',
                  'user': attendee._id.toString()
                }
              ],
              'creator': {
                '__v': 0,
                '_id': creator._id.toString(),
                'emails': [
                  'jdoe@lng.net'
                ],
                'schemaVersion': 1,
                'timestamps': {}
              },
              'history': [],
              'schemaVersion': 1,
              'timestamps': {}
            }
          ]);
          done();
        });
    });
  });

  describe('GET /conferences', function() {

    it('should redirect to / when no query parameter', function(done) {

      request(application)
        .get('/conferences')
        .send()
        .expect(302)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.headers.location).to.equal('/');
          done();
        });
    });

    it('should redirect to conference page when valid query parameter', function(done) {
      var members = [
        {
          displayName: 'FooBar',
          objectType: 'hublin:anonymous',
          id: 'creator'
        }
      ];

      apiHelpers.createConference('MyTestConference', members, [], function(err, conference) {
        if (err) {
          return done(err);
        }

        request(application)
          .get('/conferences?token=' + conference.members[0]._id)
          .send()
          .expect(302)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.headers.location).to.equal('/' + conference._id);
            done();
          });
      });
    });

    it('should 404 when invalid query parameter', function(done) {
      var token = require('mongoose').Types.ObjectId();

      request(application)
        .get('/conferences?token=' + token.toString())
        .send()
        .expect(404)
        .end(function(err, res) {
          expect(err).to.not.exist;
          done();
        });
    });

  });

  describe('GET /conferences/:id', function() {

    it('should redirect to the conference page', function(done) {
      var name = '123456789';

      request(application)
        .get('/conferences/' + name)
        .send()
        .expect(302)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.headers.location).to.equal('/' + name);
          done();
        });
    });

  });

  describe('GET /conferences/:id?displayName=XXX', function() {

    it('should redirect to the conference page', function(done) {
      var name = '123456789';

      request(application)
        .get('/conferences/' + name)
        .send()
        .expect(302)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.headers.location).to.equal('/' + name);
          done();
        });
    });
  });

  describe('PUT /api/conferences/:id?displayName=XXX', function() {

    it('should return 201 if the conference is correctly created', function(done) {
      var name = '123456789';
      var displayName = 'Yo Lo';

      request(application)
        .put('/api/conferences/' + name + '?displayName=' + displayName)
        .send()
        .expect(201)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.body._id).to.exist;
          expect(res.body._id).to.equal(name);
          expect(res.body.members).to.exist;
          expect(res.body.members.length).to.equal(1);
          expect(res.body.members[0].displayName).to.equal(displayName);
          expect(res.body.members[0].objectType).to.equal('hublin:anonymous');
          expect(res.body.members[0].id).to.equal('creator');
          done();
        });
    });

  });

  describe('PUT /api/conferences/:id', function() {

    it('should return 201 if the conference is correctly created with a user displayName', function(done) {
      var name = '123456789';

      request(application)
        .put('/api/conferences/' + name)
        .send()
        .expect(201)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.body._id).to.exist;
          expect(res.body._id).to.equal(name);
          expect(res.body.members).to.exist;
          expect(res.body.members.length).to.equal(0);
          done();
        });
    });

  });

  describe('PUT /conferences/:id?displayName=XXX', function() {

    it('should redirect if the conference is correctly created', function(done) {
      var name = '123456789';
      var displayName = 'Yo Lo';

      request(application)
        .put('/conferences/' + name + '?displayName=' + displayName)
        .send()
        .expect(302)
        .end(function(err, res) {
          expect(err).to.not.exist;
          done();
        });
    });

  });

  describe('PUT /conferences/:id', function() {

    it('should redirect if the conference is correctly created with a user displayName', function(done) {
      var name = '123456789';

      request(application)
        .put('/conferences/' + name)
        .send()
        .expect(302)
        .end(function(err, res) {
          expect(err).to.not.exist;
          done();
        });
    });

  });

  describe.skip('GET /api/conferences/:id/attendees', function() {
    it('should send back 404 if the conference is not found', function(done) {
      request(application)
        .get('/api/conferences/54e5e86e65806d7c16764b79/attendees')
        .expect(404)
        .end(done);
    });

    it('should send back 500 if there is a server error', function(done) {
      request(application)
        .get('/api/conferences/123456/attendees')
        .expect(500)
        .end(done);
    });

    it('should send back 200 and attendees of the conference', function(done) {
      request(application)
        .get('/api/conferences/' + conferenceId + '/attendees')
        .expect(200)
        .end(function(err, res) {
          expect(err).to.not.exist;
          delete res.body[0].timestamps.creation;
          expect(res.body).to.deep.equal([
            {
              '__v': 0,
              '_id': attendee._id.toString(),
              'emails': [
                'jdee@lng.net'
              ],
              'schemaVersion': 1,
              'timestamps': {}
            }
          ]);
          done();
        });
    });
  });

  describe('PUT /api/conferences/:id/members', function() {
    it('should send back 400 if the conference does not exist', function(done) {
      request(application)
        .put('/api/conferences/54e5e86e65806d7c16764b79/members')
        .expect(400)
        .end(done);
    });

    it('should send back 200 and add new members of the conference', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }
        var conference = models.conference[0];
        var onlyMemberId = conference.members[0]._id;
        var newMember = {id: 'test@open-paas.org', objectType: 'email'};
        request(application)
          .put('/api/conferences/' + conference._id + '/members')
          .set('Cookie', ['hublin.userIds=' + onlyMemberId])
          .send([newMember])
          .expect(202)
          .end(function(err, res) {
            if (err) {
              return done(err);
            }
            require('mongoose').model('Conference').findOne({_id: conference._id}, function(err, conf) {
              if (err) {
                done(err);
              }
              expect(conf.members).to.exist;
              expect(conf.members.length).to.equal(2);
              var newMemberFromDB = conf.members[1];
              expect(newMemberFromDB).to.exist;
              expect(newMemberFromDB.id).to.equal(newMember.id);
              expect(newMemberFromDB.objectType).to.equal(newMember.objectType);
              var conferenceModule = require('../../../backend/core/conference');
              expect(newMemberFromDB.status).to.equal(conferenceModule.MEMBER_STATUS.INVITED);
              done();
            });
          });
      });
    });
  });
});
