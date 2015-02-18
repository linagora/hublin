'use strict';

var ROUTERS_PATH = __dirname + '/../../backend/webserver/routes/';
var MAIN_APPLICATION_PATH = __dirname + '/../../backend/webserver/application';

var async = require('async');

function getRouter(route, dependencies) {
  return require(ROUTERS_PATH + route)(dependencies);
}

function getApplication(router) {
  var application = require(MAIN_APPLICATION_PATH);
  var all = getRouter('all');
  var login = getRouter('login');
  application.use(all);
  application.use(login);
  application.use(router);
  return application;
}

function loginAsUser(app, email, password, done) {
  var request = require('supertest');
  request(app)
    .post('/login')
    .send({username: email, password: password, rememberme: false})
    .expect(200)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      var cookies = res.headers['set-cookie'].pop().split(';').shift();
      function requestWithSessionCookie(cookies) {
        return function(r) {
          r.cookies = cookies;
          return r;
        };
      }
      return done(null, requestWithSessionCookie(cookies));
    });
}

function createConference(creator, attendees, done) {
  var Conference = require('mongoose').model('Conference');
  var json = {
    creator: creator._id || creator,
    attendees: attendees.map(function(attendee) {
      return {
        user: attendee._id || attendee,
        status: 'online'
      };
    })
  };
  var conference = new Conference(json);
  return conference.save(done);
}

/**
 * This enables deployments of common needed resources (domain, users)
 * using defined fixtures.
 * Currently it supports for each fixture the creation of one domain,
 * and users belonging to this domain.
 * The first user of the list is automatically added as the domain administrator.
 *
 *
 * @param {string} name
 * @param {object} testEnv
 * @param {object} options
 * @param {function} callback
 * @return {*}
 */
function applyDeployment(name, testEnv, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }
  var fixturesPath = options.fixtures ? options.fixtures : testEnv.fixtures + '/deployments';
  var fixtures = require(fixturesPath);
  if (! (name in fixtures)) {
    return callback(new Error('Unknown fixture name ' + name));
  }
  var deployment = fixtures[name]();
  require(testEnv.basePath + '/backend/core').db.mongo;

  deployment.models = {};

  var User = require('mongoose').model('User');
  async.map(deployment.users, function(user, callback) {
      new User(user).save(function(err, saved) {
        if (err) {
          console.log(err);
        }
        return callback(err, saved);
      });
    },
    function(err, results) {
      callback(err, results);
    }
  );
}

/**
 *
 * @type {{getRouter: getRouter, getApplication: getApplication, createConference: createConference, loginAsUser: loginAsUser}|*}
 */
module.exports = {
  getRouter: getRouter,
  getApplication: getApplication,
  createConference: createConference,
  loginAsUser: loginAsUser,
  applyDeployment: applyDeployment
};
