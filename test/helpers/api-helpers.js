'use strict';

var ROUTERS_PATH = __dirname + '/../../backend/webserver/routes/';
var MAIN_APPLICATION_PATH = __dirname + '/../../backend/webserver/application';

function getRouter(route, dependencies) {
  return require(ROUTERS_PATH + route)(dependencies);
}

function getApplication(router) {
  var application = require(MAIN_APPLICATION_PATH);
  application.use(router);
  return application;
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
 *
 * @type {{getRouter: getRouter, getApplication: getApplication}}
 */
module.exports = {
  getRouter: getRouter,
  getApplication: getApplication,
  createConference: createConference
};
