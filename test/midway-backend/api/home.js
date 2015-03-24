'use strict';

var expect = require('chai').expect,
  request = require('supertest'),
  apiHelpers = require('../../helpers/api-helpers.js'),
  httpHelpers = require('../../helpers/http-helpers.js');

var MAX_CONFERENCE_NAME_LENGTH = require('../../../backend/constants').MAX_CONFERENCE_NAME_LENGTH;
var MIN_CONFERENCE_NAME_LENGTH = require('../../../backend/constants').MIN_CONFERENCE_NAME_LENGTH;

describe('The home API', function() {

  var application;
  var deps = {
    logger: require('../fixtures/logger-noop')()
  };
  var dependencies = function(name) {
    return deps[name];
  };

  beforeEach(function(done) {
    this.testEnv.initCore(function() {
      var router = apiHelpers.getRouter('home', dependencies);
      application = apiHelpers.getApplication(router, dependencies);
      done();
    });
  });

  afterEach(function() {
    this.mongoose.connection.db.dropDatabase();
  });

  describe('GET /', function() {
    it('should render meetings/index when no query parameter', function(done) {
      request(application)
        .get('/')
        .send()
        .expect(200)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.text).to.contain('meetingsApplication');
          done();
        });
    });

    it('should redirect to /:conferenceId if conference is found by token', function(done) {
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
          .get('/?token=' + conference.members[0].token)
          .send()
          .expect(302)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.headers.location).to.equal('/MyTestConference');
            done();
          });
      });
    });

    it('should set the user cookie when conference is found by token', function(done) {
      var displayName = 'FooBar';
      var members = [
        {
          displayName: displayName,
          objectType: 'hublin:anonymous',
          id: 'creator'
        }
      ];

      apiHelpers.createConference('MyTestConference', members, [], function(err, conference) {
        if (err) {
          return done(err);
        }

        request(application)
          .get('/?token=' + conference.members[0].token)
          .send()
          .expect(302)
          .end(function(err, res) {
            expect(err).to.not.exist;
            var userCookie = httpHelpers.getCookie('user', res.headers['set-cookie']);
            expect(userCookie).to.not.be.null;
            var user = JSON.parse(userCookie);
            expect(user.displayName).to.equal(displayName);
            done();
          });
      });
    });

    it('should 404 when invalid query parameter', function(done) {
      var token = require('mongoose').Types.ObjectId();

      request(application)
        .get('/?token=' + token.toString())
        .send()
        .expect(404)
        .end(function(err, res) {
          expect(err).to.not.exist;
          done();
        });
    });

  });

  describe('GET /:id', function() {

    describe('Check room name size', function() {

      function checkConferenceExists(name, done) {
        apiHelpers.getConference(name, function(err, saved) {
          expect(err).to.not.exist;
          expect(saved).to.exist;
          done();
        });
      }

      function checkConferenceNotExists(name, done) {
        apiHelpers.getConference(name, function(err, saved) {
          expect(err).to.not.exist;
          expect(saved).to.not.exist;
          done();
        });
      }

      it('should render the liveconference/error when conference id is too long', function(done) {
        var name = this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH + 1);
        request(application)
          .get('/' + name)
          .send()
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.text).to.contain('Error');
            checkConferenceNotExists(name, done);
          });
      });

      it('should render the liveconference/index when conference id.length at max length', function(done) {
        var name = this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH);
        request(application)
          .get('/' + name)
          .send()
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.text).to.contain('liveConferenceApplication');
            checkConferenceExists(name, done);
          });
      });

      it('should render the liveconference/index when conference id.length is at min length', function(done) {
        var name = this.helpers.utils.generateStringWithLength(MIN_CONFERENCE_NAME_LENGTH);
        request(application)
          .get('/' + name)
          .send()
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.text).to.contain('liveConferenceApplication');
            checkConferenceExists(name, done);
          });
      });
    });

    it('should render the liveconference/index and create a new conference if not exists', function(done) {
      var name = '123456789';

      request(application)
        .get('/' + name)
        .send()
        .expect(200)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.text).to.contain('liveConferenceApplication');
          apiHelpers.getConference(name, function(err, saved) {
            var object = saved.toObject();
            delete object.timestamps.created;
            delete object.members[0]._id;
            delete object.members[0].id;
            delete object.members[0].token;
            expect(object.members).to.be.an('array');
            expect(object.members).to.have.length(1);
            expect(object.members[0].connection).to.have.property('userAgent');
            expect(object.members[0].connection.userAgent).to.match(/node-superagent/);
            delete(object.members[0].connection.userAgent);
            expect(object).to.deep.equal({
              '__v': 0,
              '_id': '123456789',
              'active': true,
              'configuration': {
                'hosts': [
                  {
                    'type': 'ws',
                    'url': ''
                  }
                ]
              },
              'createdFrom': 'web',
              'history': [],
              'members': [
                {
                  'connection': { 'ipAddress': '127.0.0.1' },
                  'displayName': 'anonymous',
                  'objectType': 'hublin:anonymous',
                  'status': 'offline'
                }
              ],
              'schemaVersion': 1,
              'timestamps': {}
            });
            done();
          });
        });
    });

    it('should render the liveconference/index, create a new conference and given displayName if it is in query', function(done) {
      var name = '123456789';

      request(application)
        .get('/' + name + '?displayName=aGuy')
        .send()
        .expect(200)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.text).to.contain('liveConferenceApplication');
          apiHelpers.getConference(name, function(err, saved) {
            var object = saved.toObject();
            delete object.timestamps.created;
            delete object.members[0]._id;
            delete object.members[0].id;
            delete object.members[0].token;
            expect(object.members).to.be.an('array');
            expect(object.members).to.have.length(1);
            expect(object.members[0].connection).to.have.property('userAgent');
            expect(object.members[0].connection.userAgent).to.match(/node-superagent/);
            delete(object.members[0].connection.userAgent);
            expect(object).to.deep.equal({
              '__v': 0,
              '_id': '123456789',
              'active': true,
              'configuration': {
                'hosts': [
                  {
                    'type': 'ws',
                    'url': ''
                  }
                ]
              },
              'createdFrom': 'web',
              'history': [],
              'members': [
                {
                  'connection': { 'ipAddress': '127.0.0.1' },
                  'displayName': 'aGuy',
                  'objectType': 'hublin:anonymous',
                  'status': 'offline'
                }
              ],
              'schemaVersion': 1,
              'timestamps': {}
            });
            done();
          });
        });
    });

    it('should render the liveconference/index and add user to the found conference with given displayName', function(done) {
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
          .get('/' + conference._id + '?displayName=aGuy')
          .send()
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.text).to.contain('liveConferenceApplication');
            apiHelpers.getConference(conference._id, function(err, saved) {
              var object = saved.toObject();
              delete object.timestamps.created;
              delete object.members[0]._id;
              delete object.members[1]._id;
              delete object.members[1].id;
              delete object.members[0].token;
              expect(object.members).to.be.an('array');
              expect(object.members).to.have.length(2);
              expect(object.members[1].connection).to.have.property('userAgent');
              expect(object.members[1].connection.userAgent).to.match(/node-superagent/);
              delete(object.members[1].connection.userAgent);
              expect(object.members[1].token).to.have.length(36);
              delete object.members[1].token;
              expect(object).to.deep.equal({
                '__v': 1,
                '_id': 'MyTestConference',
                'active': true,
                'configuration': {
                  'hosts': []
                },
                'createdFrom': 'web',
                'history': [],
                'members': [
                  {
                    'displayName': 'FooBar',
                    'id': 'creator',
                    'objectType': 'hublin:anonymous',
                    'status': 'offline'
                  },
                  {
                    'connection': { 'ipAddress': '127.0.0.1' },
                    'displayName': 'aGuy',
                    'status': 'offline',
                    'objectType': 'hublin:anonymous'
                  }
                ],
                'schemaVersion': 1,
                'timestamps': {}
              });
              done();
            });
          });
      });
    });

    it('should create the user cookie', function(done) {
      var displayName = 'aGuy';
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
          .get('/' + conference._id + '?displayName=' + displayName)
          .send()
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.text).to.contain('liveConferenceApplication');

            var userCookie = httpHelpers.getCookie('user', res.headers['set-cookie']);
            expect(userCookie).to.not.be.null;
            var user = JSON.parse(userCookie);
            expect(user.displayName).to.equal(displayName);
            done();
          });
      });
    });

    it('should create the X-Hublin-Token header', function(done) {
      var displayName = 'aGuy';
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
          .get('/' + conference._id + '?displayName=' + displayName)
          .send()
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            var header = res.header['x-hublin-token'];
            apiHelpers.getConference(conference._id, function(err, conf) {
              expect(err).to.not.exist;
              conf.members.forEach(function(member) {
                if (member.displayName === displayName) {
                  expect(header).to.equal(member.token);
                }
              });
            });

            done();
          });
      });
    });

    describe('lazyArchive', function() {

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

        this._checkConference = function(id, done) {
          require('mongoose').model('Conference').findOne({_id: id}, function(err, conference) {
            if (err) {
              return done(err);
            }
            if (!conference) {
              return done(new Error('conference ' + id + ' not found'));
            }
            return done();
          });
        };
      });

      it('should archive an inactive conference', function(done) {
        var _checkArchivedConference = this._checkArchivedConference;
        request(application)
          .get('/inactiveConference')
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            _checkArchivedConference('inactiveConference', done);
          });
      });

      it('should create a new conference', function(done) {
        var _checkConference = this._checkConference;
        request(application)
          .get('/inactiveConference')
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            _checkConference('inactiveConference', done);
          });
      });
      it('should not archive an active conference', function(done) {
        var _checkNoArchivedConference = this._checkNoArchivedConference;
        request(application)
          .get('/otherConference')
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            request(application)
              .get('/otherConference')
              .expect(200)
              .end(function(err, res) {
                _checkNoArchivedConference('otherConference', done);
              });
          });
      });
    });
  });

});
