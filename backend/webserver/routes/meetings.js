'use strict';

var express = require('express');
var cors = require('cors');

/**
 * Fake router for testing purposes
 * @param {function} dependencies
 * @return {Router}
 */
module.exports = function(dependencies) {

  var controllers = require('../controllers/meetings')(dependencies);
  var middlewares = require('../middlewares/passThrough')(dependencies);

  var router = express.Router();

  router.all('/api/*', cors(), middlewares.passThrough);

  router.get('/api/meetings', controllers.hello);

  return router;
};
