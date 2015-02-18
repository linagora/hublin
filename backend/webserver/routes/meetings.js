'use strict';

var express = require('express');

/**
 * Fake router for testing purposes
 * @param {function} dependencies
 * @return {Router}
 */
module.exports = function(dependencies) {

  var controllers = require('../controllers/meetings')(dependencies);
  var middlewares = require('../middlewares/passThrough')(dependencies);

  var router = express.Router();

  router.get('/meetings', middlewares.passThrough, controllers.hello);

  return router;
};
