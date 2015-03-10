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

  describe('GET /api/conferences/:id', function() {
    it.skip('should send back 404 if the conference is not found', function(done) {
      request(application)
        .get('/api/conferences/54e5e86e65806d7c16764b79')
        .expect(404)
        .end(done);
    });

    it.skip('should send back 500 if there is a server error', function(done) {
      request(application)
        .get('/api/conferences/123456')
        .expect(500)
        .end(done);
    });

    it.skip('should send back 200 with the conference if it is found', function(done) {
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

  describe('PUT /api/conferences/:id?displayName=XXX', function() {

    function checkUserIsConferenceMember(name, displayName, done) {
      apiHelpers.getConference(name, function(err, conf) {
        if (err) {
          done(err);
        }
        expect(conf.members).to.exists;
        expect(conf.members.length).to.equals(1);
        expect(conf.members[0].displayName).to.equals(displayName);
        done();
      });
    }

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
          done();
        });
    });

    it('should return 200 if the conference already exists', function(done) {
      var name = '123456789';
      var displayName = 'Yo Lo';

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
            checkUserIsConferenceMember(name, displayName, done);
          });
      });
    });

    it('should return 400 if the conference already exists and the user wants to add members', function(done) {
      var name = '123456789';
      var displayName = 'Yo Lo';

      apiHelpers.createConference(name, [], [], function(err) {
        if (err) {
          return done(err);
        }

        request(application)
          .put('/api/conferences/' + name + '?displayName=' + displayName)
          .send({members: [{id: 'yo@hubl.in', objectType: 'email'}]})
          .expect(400)
          .end(function(err, res) {
            expect(err).to.not.exist;
            checkUserIsConferenceMember(name, displayName, done);
          });
      });
    });

  });

  describe('PUT /api/conferences/:id', function() {

    it('should return 201 if the conference is correctly created', function(done) {
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
          expect(res.body.members.length).to.equal(1);
          expect(res.body.members[0].objectType).to.equal('hublin:anonymous');
          done();
        });
    });

    it('should return 200 if the conference already exists', function(done) {
      var name = '123456789';

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

    it('should return 400 if the conference already exists and the user wants to add members', function(done) {
      var name = '123456789';

      apiHelpers.createConference(name, [], [], function(err) {
        if (err) {
          return done(err);
        }

        request(application)
          .put('/api/conferences/' + name)
          .send({members: [{id: 'yo@hubl.in', objectType: 'email'}]})
          .expect(400)
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
      request(application)
        .get('/api/conferences/54e5e86e65806d7c16764b79/members')
        .expect(400)
        .end(done);
    });

    it('should send back 200 and attendees of the conference', function(done) {
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
            expect(returnedMember._id).to.equal(confMember._id.toString());
            expect(returnedMember.id).to.equal(confMember.id);
            expect(returnedMember.objectType).to.equal(confMember.objectType);
            expect(returnedMember.displayName).to.equal(confMember.displayName);

            done();
          });
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

  describe('PUT /api/conferences/:id/members/:mid/:field', function() {

    it('should send back 400 if the conference does not exist', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }
        var conference = models.conference[0];
        var onlyMemberId = conference.members[0]._id;

        request(application)
          .put('/api/conferences/54e5e86e65806d7c16764b79/members/' + conference.members[0]._id + '/displayName')
          .set('Cookie', ['hublin.userIds=' + onlyMemberId])
          .send({value: 'Bruce'})
          .expect(400)
          .end(function(err, data) {
            if (err) {
              return done(err);
            }
            expect(data.body.error.details).to.match(/conference is required in request/);
             done();
          });
      });
    });

    it.skip('should send back 403 when trying to update member which is not himself', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }

        var conference = models.conference[0];
        var onlyMemberId = conference.members[0]._id;

        request(application)
          .put('/api/conferences/' + conference._id + '/members/54e5e86e65806d7c16764b79/displayName')
          .set('Cookie', ['hublin.userIds=' + onlyMemberId])
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

        request(application)
          .put('/api/conferences/' + conference._id + '/members/' + conference.members[0]._id + '/unsupported')
          .set('Cookie', ['hublin.userIds=' + onlyMemberId])
          .send({value: 'Bruce'})
          .expect(400)
          .end(done);
      });
    });

    it('should send back 400 if the data is not set', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }

        var conference = models.conference[0];
        var onlyMemberId = conference.members[0]._id;

        request(application)
          .put('/api/conferences/' + conference._id + '/members/' + conference.members[0]._id + '/unsupported')
          .set('Cookie', ['hublin.userIds=' + onlyMemberId])
          .expect(400)
          .end(done);
      });
    });

    it('should send back 200 and have updated data', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }

        var field = 'displayName';
        var value = 'Bruce';

        var conference = models.conference[0];
        var onlyMemberId = conference.members[0]._id;

        request(application)
          .put('/api/conferences/' + conference._id + '/members/' + conference.members[0]._id + '/' + field)
          .set('Cookie', ['hublin.userIds=' + onlyMemberId])
          .send({value: value})
          .expect(200)
          .end(function(err) {
            if (err) {
              return done(err);
            }

            require('mongoose').model('Conference').findOne({_id: conference._id}, function(err, conf) {
              if (err) {
                done(err);
              }
              expect(conf.members[0].displayName).to.equal(value);
              done();
            });
          });
      });
    });

    it.skip('should not be able to update without user cookie', function(done) {
      apiHelpers.applyDeployment('oneMemberConference', this.testEnv, {}, function(err, models) {
        if (err) {
          return done(err);
        }

        var field = 'displayName';
        var value = 'Bruce';

        var conference = models.conference[0];

        request(application)
          .put('/api/conferences/' + conference._id + '/members/' + conference.members[0]._id + '/' + field)
          .send({value: value})
          .expect(400)
          .end(function(err) {
            if (err) {
              return done(err);
            }

            require('mongoose').model('Conference').findOne({_id: conference._id}, function(err, conf) {
              if (err) {
                done(err);
              }
              expect(conf.members[0].displayName).to.not.equal(value);
              done();
            });
          });
      });
    });
  });
});
