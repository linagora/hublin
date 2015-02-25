'use strict';

var express = require('express');

/**
 *
 * @param {hash} dependencies
 * @return {*}
 */
module.exports = function(dependencies) {

  var controllers = require('../controllers/home')(dependencies);

  var router = express.Router();

  // MEET-52 Keep this order, it is important here.
  router.get('/:id', controllers.liveconference);
  router.get('/', controllers.meetings);

  return router;
};
