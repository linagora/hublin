'use strict';

var expect = require('chai').expect,
    request = require('supertest'),
    MongoClient = require('mongodb').MongoClient,
    apiHelpers = require('../helpers/api-helpers.js'),
    q = require('q');


describe('The application', function() {
  var application;
  var deps = {
    logger: require('../fixtures/logger-noop')(),
    'config': function() {}
  };
  var dependencies = function(name) {
    return deps[name];
  };

  function injectConfig(testEnv, config) {
    return q.Promise(function(resolve, reject) {
      MongoClient.connect(testEnv.mongoUrl, function(err, db) {
        db.collection('configuration').insert(config, function(err, res) {
          db.close(function() {});
          if (err) {
            reject(err);
          } else {
            resolve(testEnv);
          }
        });
      });
    });
  }

  function initCore(testEnv) {
    return q.Promise(function(resolve, reject) {
      testEnv.initCore(function() {
        var router = apiHelpers.getRouter('home', dependencies);
        application = apiHelpers.getApplication(router, dependencies);
        resolve();
      });
    });
  }

  afterEach(function() {
    this.mongoose.connection.db.dropDatabase();
  });

  it('should render the page using en when no defaultLocale is set', function(done) {

    function launchTest() {
      request(application)
        .get('/')
        .set('Accept-Language', 'klington')
        .send()
        .expect(200)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.text).to.contain('Start with Hubl.in');
          done();
        });
    }

    initCore(this.testEnv)
    .then(function() {
      setTimeout(launchTest, 100);
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should render the page using the defaultLocale', function(done) {

    function launchTest() {
      request(application)
        .get('/')
        .set('Accept-Language', 'klington')
        .send()
        .expect(200)
        .end(function(err, res) {
          expect(err).to.not.exist;
          expect(res.text).to.contain('Lancez-vous avec Hubl.in');
          done();
        });
    }

    injectConfig(this.testEnv, {_id: 'i18n', defaultLocale: 'fr'})
    .then(initCore)
    .then(function() {
      setTimeout(launchTest, 100);
    })
    .catch(function(err) {
      done(err);
    });
  });
});
