'use strict';

var expect = require('chai').expect,
  request = require('supertest'),
  apiHelpers = require('../../helpers/api-helpers.js');

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
      application = apiHelpers.getApplication(router);
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

    it('should render live-conference/index if conf is found by token', function(done) {
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
          .get('/?token=' + conference.members[0]._id)
          .send()
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.text).to.contain('liveConferenceApplication');
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
            expect(object).to.deep.equal({
              '__v': 0,
              '_id': '123456789',
              'active': true,
              'createdFrom': 'web',
              'history': [],
              'members': [
                {
                  'connection': {
                    'userAgent': 'node-superagent/0.18.0'
                  },
                  'displayName': 'anonymous',
                  'id': 'user',
                  'objectType': 'hublin:anonymous'
                }
              ],
              'schemaVersion': 1,
              'timestamps': {}
            });
          });
          done();
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
            expect(object).to.deep.equal({
              '__v': 0,
              '_id': '123456789',
              'active': true,
              'createdFrom': 'web',
              'history': [],
              'members': [
                {
                  'connection': {
                    'userAgent': 'node-superagent/0.18.0'
                  },
                  'displayName': 'aGuy',
                  'id': 'user',
                  'objectType': 'hublin:anonymous'
                }
              ],
              'schemaVersion': 1,
              'timestamps': {}
            });
          });
          done();
        });
    });

    it('should render the liveconference/index and join the found conference with given displayName', function(done) {
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
              expect(object).to.deep.equal({
                '__v': 1,
                '_id': 'MyTestConference',
                'active': true,
                'createdFrom': 'web',
                'history': [],
                'members': [
                  {
                    'displayName': 'FooBar',
                    'id': 'creator',
                    'objectType': 'hublin:anonymous'
                  },
                  {
                    'connection': {
                      'userAgent': 'node-superagent/0.18.0'
                    },
                    'displayName': 'aGuy',
                    'id': 'user',
                    'status': 'online',
                    'objectType': 'hublin:anonymous'
                  }
                ],
                'schemaVersion': 1,
                'timestamps': {}
              });
            });
            done();
          });
      });
    });

  });

});
