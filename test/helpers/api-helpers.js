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

/**
 *
 * @type {{getRouter: getRouter, getApplication: getApplication}}
 */
module.exports = {
  getRouter: getRouter,
  getApplication: getApplication
};
