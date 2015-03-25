'use strict';

var expect = require('chai').expect,
    request = require('supertest'),
    express = require('express'),
    apiHelpers = require('../../helpers/api-helpers.js'),
    httpHelpers = require('../../helpers/http-helpers.js');

var MAX_CONFERENCE_NAME_LENGTH = require('../../../backend/constants').MAX_CONFERENCE_NAME_LENGTH;
var MIN_CONFERENCE_NAME_LENGTH = require('../../../backend/constants').MIN_CONFERENCE_NAME_LENGTH;

describe('The conference API', function() {
  var application;
  var deps = {
    logger: require('../fixtures/logger-noop')()
  };
  var dependencies = function(name) {
    return deps[name];
  };

  beforeEach(function(done) {
    function checkMember(member) {
      expect(member).to.not.have.property('id');
      expect(member).to.not.have.property('token');
      expect(member).to.have.property('_id');
      expect(member).to.have.property('displayName');
      expect(member).to.have.property('status');
    }
    this.checkMember = checkMember;

    this.checkConferenceRestSanitization = function(conference) {
      expect(conference).to.not.have.property('history');
      expect(conference.members).to.be.an('array');
      conference.members.forEach(checkMember);

    };
    this.testEnv.initCore(function() {
      var router = apiHelpers.getRouter('conferences', dependencies);
      application = apiHelpers.getApplication(router, dependencies);
      done();
    });
  });

  afterEach(function() {
    this.mongoose.connection.db.dropDatabase();
  });

  function withSession(data) {
    var sessionApp = express();
    sessionApp.all('*', function(req, res, next) {
      req.session = data;
      next();
    });
    sessionApp.use(application);
    return sessionApp;
  }

  function withSessionUser(conference) {
    var session = { conferenceToUser: {} };
    if (conference) {
      session.conferenceToUser[conference._id] = conference.members[0];
    }
    return withSession(session);
  }

  describe('GET /api/conferences/:id', function() {
    beforeEach(function(done) {
      var self = this;
      apiHelpers.applyDeployment('someMembersConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }
        self.conference = models.conference[0];
        done();
      });

    });

    it('should send back 404 if the conference is not found', function(done) {
      request(application)
        .get('/api/conferences/54e5e86e65806d7c16764b79')
        .expect(404)
        .end(done);
    });

    it('should send back 200 and the conference', function(done) {
      var checkConferenceRestSanitization = this.checkConferenceRestSanitization;
      request(application)
        .get('/api/conferences/someMembersConference')
        .expect(200)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.body._id).to.equal('someMembersConference');
          checkConferenceRestSanitization(res.body);
          done();
        });
    });

    describe('lazyArchive middleware', function() {
      beforeEach(function(done) {
        var self = this;
        apiHelpers.applyDeployment('inactiveConference', this.testEnv, {}, function(err, models) {
          if (err) {
            return done(err);
          }
          self.models = models;
          done();
        });
        this._checkArchivedConference = function(id, done) {
          require('mongoose').model('ConferenceArchive').findOne({initial_id: id}, function(err, conference) {
            if (err) {
              return done(err);
            }
            if (!conference) {
              return done(new Error('conference archive ' + id + ' not found'));
            }
            return done();
          });
        };

        this._checkNoArchivedConference = function(id, done) {
          require('mongoose').model('ConferenceArchive').findOne({initial_id: id}, function(err, conference) {
            if (err) {
              return done(err);
            }
            if (conference) {
              return done(new Error('conference archive ' + id + ' found'));
            }
            return done();
          });
        };
      });

      it('should archive an inactive conference', function(done) {
        var _checkArchivedConference = this._checkArchivedConference;
        request(application)
          .get('/api/conferences/inactiveConference')
          .expect(404)
          .end(function(err, res) {
            expect(err).to.not.exist;
            _checkArchivedConference('inactiveConference', done);
        });
      });

      it('should not archive an active conference', function(done) {
        var _checkNoArchivedConference = this._checkNoArchivedConference;
        request(application).put('/api/conferences/other').send().expect(201)
          .end(function(err, res) {
            request(application)
              .get('/api/conferences/other')
              .expect(200)
              .end(function(err, res) {
                expect(err).to.not.exist;
                _checkNoArchivedConference('other', done);
            });
          });
      });
    });
  });

  describe('PUT /api/conferences/:id?displayName=XXX', function() {

    function checkUserIsConferenceMember(name, displayName, done) {
      apiHelpers.getConference(name, function(err, conf) {
        if (err) {
          done(err);
        }
        expect(conf.members).to.exists;
        var isIn = conf.members.some(function(member) {
          return member.displayName === displayName;
        });
        expect(isIn).to.be.true;
        done();
      });
    }

    it('should return 201 if the conference is correctly created', function(done) {
      var name = '123456789';
      var displayName = 'Yo Lo';
      var checkConferenceRestSanitization = this.checkConferenceRestSanitization;
      request(application)
        .put('/api/conferences/' + name + '?displayName=' + displayName)
        .send()
        .expect(201)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.body._id).to.exist;
          expect(res.body._id).to.equal(name);
          checkConferenceRestSanitization(res.body);
          expect(res.body.members.length).to.equal(1);
          expect(res.body.members[0].displayName).to.equal(displayName);
          expect(res.body.members[0].objectType).to.equal('hublin:anonymous');
          done();
        });
    });

    it('should return 200 if the conference already exists', function(done) {
      var name = '123456789';
      var displayName = 'Yo Lo';
      var checkConferenceRestSanitization = this.checkConferenceRestSanitization;
      apiHelpers.createConference(name, [], [], function(err) {
        if (err) {
          return done(err);
        }

        request(application)
          .put('/api/conferences/' + name + '?displayName=' + displayName)
          .send()
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.body._id).to.exist;
            expect(res.body._id).to.equal(name);
            checkConferenceRestSanitization(res.body);
            checkUserIsConferenceMember(name, displayName, done);
          });
      });
    });

    it('should return 202 if the conference already exists and the user wants to add members', function(done) {
      var name = '123456789';
      var displayName = 'Yo Lo';

      apiHelpers.createConference(name, [], [], function(err) {
        if (err) {
          return done(err);
        }

        request(application)
          .put('/api/conferences/' + name + '?displayName=' + displayName)
          .send({members: [{id: 'yo@hubl.in', objectType: 'email'}]})
          .expect(202)
          .end(function(err, res) {
            expect(err).to.not.exist;
            checkUserIsConferenceMember(name, displayName, done);
          });
      });
    });

  });

  describe('PUT /api/conferences/:id', function() {

    describe('Check room name size', function() {

      it('should return 400 if the conference id is too long', function(done) {
        var name = this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH + 1);
        request(application)
          .put('/api/conferences/' + name)
          .send()
          .expect(400)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.match(/Conference id is too long/);
            done();
          });
      });

      it('should return 201 if the conference id.length is equals to min length', function(done) {
        var name = this.helpers.utils.generateStringWithLength(MIN_CONFERENCE_NAME_LENGTH);
        request(application)
          .put('/api/conferences/' + name)
          .send()
          .expect(201)
          .end(this.helpers.callbacks.noError(done));
      });

      it('should return 201 if the conference id.length is equals to max length', function(done) {
        var name = this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH);
        request(application)
          .put('/api/conferences/' + name)
          .send()
          .expect(201)
          .end(this.helpers.callbacks.noError(done));
      });
    });

    it('should return 201 if the conference is correctly created', function(done) {
      var name = '123456789';
      var checkConferenceRestSanitization = this.checkConferenceRestSanitization;
      request(application)
        .put('/api/conferences/' + name)
        .send()
        .expect(201)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.body._id).to.exist;
          expect(res.body._id).to.equal(name);
          checkConferenceRestSanitization(res.body);
          expect(res.body.members.length).to.equal(1);
          expect(res.body.members[0].objectType).to.equal('hublin:anonymous');
          done();
        });
    });

    it('should return 200 if the conference already exists', function(done) {
      var name = '123456789';
      var checkConferenceRestSanitization = this.checkConferenceRestSanitization;

      apiHelpers.createConference(name, [], [], function(err) {
        if (err) {
          return done(err);
        }

        request(application)
          .put('/api/conferences/' + name)
          .send()
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.body._id).to.exist;
            expect(res.body._id).to.equal(name);
            checkConferenceRestSanitization(res.body);

            apiHelpers.getConference(name, function(err, conf) {
              if (err) {
                done(err);
              }
              expect(conf.members).to.exists;
              expect(conf.members.length).to.equals(1);
              done();
            });
          });
      });
    });

    it('should return 202 if the conference already exists and the user wants to add members', function(done) {
      var name = '123456789';

      apiHelpers.createConference(name, [], [], function(err) {
        if (err) {
          return done(err);
        }

        request(application)
          .put('/api/conferences/' + name)
          .send({members: [{id: 'yo@hubl.in', objectType: 'email'}]})
          .expect(202)
          .end(function(err, res) {
            expect(err).to.not.exist;
            done();
          });
      });
    });

    it('should return 400 if the conference id is forbidden', function(done) {
      var blacklist = this.helpers.requireBackend('core/conference/helpers').forbiddenIds;
      var count = 0;

      function tryCreateConferenceForName(name) {
        request(application)
          .put('/api/conferences/' + name)
          .send()
          .expect(400)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.error).to.exist;
            count++;
            if (count === blacklist.length) {
              done();
            }
          });
      }

      blacklist.forEach(tryCreateConferenceForName);
    });

    describe('lazyArchive middleware', function() {
      beforeEach(function(done) {
        var self = this;
        apiHelpers.applyDeployment('inactiveConference', this.testEnv, {}, function(err, models) {
          if (err) {
            return done(err);
          }
          self.models = models;
          done();
        });
        this._checkArchivedConference = function(id, done) {
          require('mongoose').model('ConferenceArchive').findOne({initial_id: id}, function(err, conference) {
            if (err) {
              return done(err);
            }
            if (!conference) {
              return done(new Error('conference archive ' + id + ' not found'));
            }
            return done();
          });
        };

        this._checkNoArchivedConference = function(id, done) {
          require('mongoose').model('ConferenceArchive').findOne({initial_id: id}, function(err, conference) {
            if (err) {
              return done(err);
            }
            if (conference) {
              return done(new Error('conference archive ' + id + ' found'));
            }
            return done();
          });
        };
      });

      it('should archive the inactive conference', function(done) {
        var _checkArchivedConference = this._checkArchivedConference;
        request(application)
          .put('/api/conferences/inactiveConference')
          .send()
          .expect(201)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.body._id).to.exist;
            expect(res.body._id).to.equal('inactiveConference');
            expect(res.body.members).to.exist;
            expect(res.body.members.length).to.equal(1);
            expect(res.body.members[0].objectType).to.equal('hublin:anonymous');
            _checkArchivedConference('inactiveConference', done);
          });
      });
      it('should not archive an active conference', function(done) {
        var _checkNoArchivedConference = this._checkNoArchivedConference;
        request(application).put('/api/conferences/other')
          .send().expect(201).end(function(err, res) {
            expect(err).to.not.exist;
            request(application).put('/api/conferences/other')
              .send().expect(200).end(function(err, res) {
                expect(err).to.not.exist;
                _checkNoArchivedConference('other', done);
              });
          });
      });
    });
  });

  describe('GET /api/conferences/:id/members', function() {
    it('should send back 400 if the conference does not exist', function(done) {
      request(withSessionUser())
        .get('/api/conferences/54e5e86e65806d7c16764b79/members')
        .expect(400)
        .end(done);
    });

    it('should send back 200 and attendees of the conference', function(done) {
      var checkAPImemberAgainstMongooseDocument = this.helpers.checkAPImemberAgainstMongooseDocument;
      var checkMember = this.checkMember;
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }
        var conference = models.conference[0];
        var confMember = conference.members[0];
        request(application)
          .get('/api/conferences/' + conference._id + '/members')
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.body).to.be.an.array;
            expect(res.body.length).to.equal(1);
            var returnedMember = res.body[0];
            checkMember(returnedMember);
            checkAPImemberAgainstMongooseDocument(returnedMember, confMember);
            done();
          });
      });
    });
  });

  describe('PUT /api/conferences/:id/members', function() {
    it('should send back 400 if the conference does not exist', function(done) {
      request(withSessionUser())
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
        var newMember = {id: 'test@open-paas.org', objectType: 'email'};
        request(withSessionUser(conference))
          .put('/api/conferences/' + conference._id + '/members')
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

  describe('PUT /api/conferences/:id/members/:mid/:field', function() {

    it('should send back 400 if the conference does not exist', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }
        var conference = models.conference[0];

        request(withSessionUser(conference))
          .put('/api/conferences/54e5e86e65806d7c16764b79/members/' + conference.members[0]._id + '/displayName')
          .send({value: 'Bruce'})
          .expect(400)
          .end(function(err, data) {
            if (err) {
              return done(err);
            }
            expect(data.body.error.details).to.match(/conference is required in the request/);
             done();
          });
      });
    });

    it('should send back 403 when trying to update member which is not himself', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }
        var conference = models.conference[0];

        request(withSessionUser(conference))
          .put('/api/conferences/' + conference._id + '/members/54e5e86e65806d7c16764b79/displayName')
          .send({value: 'Bruce'})
          .expect(403)
          .end(function(err, data) {
            if (err) {
              return done(err);
            }
            expect(data.body.error.details).to.match(/User cannot update other member/);
            done();
          });
      });
    });

    it('should send back 400 if the field is not supported', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }
        var conference = models.conference[0];
        var onlyMemberId = conference.members[0]._id;

        request(withSessionUser(conference))
          .put('/api/conferences/' + conference._id + '/members/' + onlyMemberId + '/cupsize')
          .send({value: 'Fred'})
          .expect(400)
          .end(function(err, data) {
            if (err) {
              return done(err);
            }
            expect(data.body.error.details).to.match(/Can not update cupsize/);
            done();
          });
      });
    });

    it('should send back 400 if the data is not set', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }

        var conference = models.conference[0];

        request(withSessionUser(conference))
          .put('/api/conferences/' + conference._id + '/members/' + conference.members[0]._id + '/unsupported')
          .expect(400)
          .end(done);
      });
    });

    it('should send back 200 and have updated data', function(done) {
      var checkMember = this.checkMember;
      var name = 'Fred';
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }
        var conference = models.conference[0];
        var onlyMemberId = conference.members[0]._id;

        request(withSessionUser(conference))
          .put('/api/conferences/' + conference._id + '/members/' + onlyMemberId + '/displayName')
          .send({value: name})
          .expect(200)
          .end(function(err, data) {
            if (err) {
              return done(err);
            }
            checkMember(data.body);
            expect(data.body.displayName).to.equal(name);
            var userCookie = httpHelpers.getCookie('user', data.headers['set-cookie']);
            expect(userCookie).to.not.be.null;
            var user = JSON.parse(userCookie);
            expect(user.displayName).to.equal(name);
            done();
          });
      });
    });

    it('should not be able to update without user session', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }

        var conference = models.conference[0];

        request(application)
          .put('/api/conferences/' + conference._id + '/members/' + conference.members[0]._id + '/displayName')
          .send({value: 'Fred'})
          .expect(403)
          .end(done);
      });
    });
  });

  describe('POST /api/conferences/:id/reports', function() {

    it('should not be able to create a report without user session', function(done) {
      apiHelpers.applyDeployment('manyMembersConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }

        var conference = models.conference[0]._id,
          reported = models.conference[0].members[2]._id,
          members = [
            models.conference[0].members[0]._id, models.conference[0].members[1]._id,
            models.conference[0].members[3]._id],
          description = 'description of the report';

        request(application)
          .post('/api/conferences/' + conference + '/reports')
          .send({
            reported: reported,
            members: members,
            description: description
          })
          .expect(403)
          .end(done);
      });
    });

    it('should send back 400 if missing or wrong parameters', function(done) {
      apiHelpers.applyDeployment('manyMembersConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }

        request(withSessionUser(models.conference[0]))
          .post('/api/conferences/' + models.conference[0]._id + '/reports')
          .send({
            reported: 'khkjhlk',
            members: ['khkjhlk']
          })
          .expect(400)
          .end(done);
      });
    });

    it('should create the report', function(done) {
      apiHelpers.applyDeployment('manyMembersConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }

        var conference = models.conference[0]._id,
          reported = models.conference[0].members[2]._id,
          reporter = models.conference[0].members[0]._id,
          members = [
            models.conference[0].members[0]._id, models.conference[0].members[1]._id,
            models.conference[0].members[3]._id],
          description = 'description of the report';

        request(withSessionUser(models.conference[0]))
          .post('/api/conferences/' + conference + '/reports')
          .send({
            reported: reported,
            members: members,
            description: description
          })
          .expect(201)
          .end(function(err, data) {
            if (err) {
              return done(err);
            }

            require('mongoose').model('Report').findOne({_id: data.body.id}, function(err, reportFound) {
              if (err) {
                done(err);
              }

              expect(reportFound).to.not.equals(null);
              expect(reportFound.timestamp).to.exist;
              expect(reportFound.conference._id).to.deep.equals(conference);
              expect(reportFound.reported._id).to.deep.equals(reported);
              expect(reportFound.reporter._id).to.deep.equals(reporter);
              expect(reportFound.members.length).to.equals(members.length);
              expect(reportFound.members[0]._id === members[0]._id);
              expect(reportFound.members[1]._id === members[1]._id);
              expect(reportFound.members[2]._id === members[2]._id);
              expect(reportFound.description).to.equals(description);

              done();
            });
          });
      });
    });
  });

});
