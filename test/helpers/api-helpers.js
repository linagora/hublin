'use strict';

var WEBSERVER_PATH = __dirname + '/../../backend/webserver';
var ROUTERS_PATH = WEBSERVER_PATH + '/routes/';
var MAIN_APPLICATION_PATH = WEBSERVER_PATH + '/application';

var async = require('async');

function getRouter(route, dependencies) {
  return require(ROUTERS_PATH + route)(dependencies);
}

function getApplication(router, dependencies) {
  var application = require(MAIN_APPLICATION_PATH);
  var all = getRouter('all', dependencies);
  application.use(all);
  application.use(router);

  var errors = require(WEBSERVER_PATH + '/errors')(dependencies);
  application.use('/api/*', errors.apiErrorHandler);

  return application;
}

function createConference(name, members, history, done) {
  var Conference = require('mongoose').model('Conference');
  var json = {
    _id: name,
    members: members || [],
    history: history || []
  };
  var conference = new Conference(json);
  return conference.save(done);
}

function getConference(id, done) {
  var Conference = require('mongoose').model('Conference');
  return Conference.findById(id, done);
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

  function saveConferences() {
    var Conference = require('mongoose').model('Conference');
    async.map(deployment.conferences, function(conf, mapCallback) {
        new Conference(conf).save(function(err, saved) {
          if (err) {
            console.log(err);
          }
          return mapCallback(err, saved);
        });
      },
      function(err, results) {
        if (err) {
          return callback(err);
        }
        deployment.models.conference = results;
        callback(err, deployment.models);
      }
    );
  }

  var User = require('mongoose').model('User');
  async.map(deployment.users, function(user, mapCallback) {
      new User(user).save(function(err, saved) {
        if (err) {
          console.log(err);
        }
        return mapCallback(err, saved);
      });
    },
    function(err, results) {
      if (err) {
        return callback(err);
      }
      deployment.models.users = results;
      saveConferences();
    }
  );
}

/**
 *
 * @type {{getRouter: getRouter, getApplication: getApplication, createConference: createConference, applyDeployment: applyDeployment}|*}
 */
module.exports = {
  getRouter: getRouter,
  getApplication: getApplication,
  createConference: createConference,
  getConference: getConference,
  applyDeployment: applyDeployment
};
