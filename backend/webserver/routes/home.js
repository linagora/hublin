'use strict';

var express = require('express');

/**
 *
 * @param {hash} dependencies
 * @return {*}
 */
module.exports = function(dependencies) {

  var controllers = require('../controllers/home')(dependencies);
  var conference = require('../middlewares/conference')(dependencies);
  var user = require('../middlewares/user');

  var router = express.Router();

  // MEET-52 Keep this order, it is important here.
  router.get('/:id', user.load, conference.joinOrCreate, controllers.liveconference);
  router.get('/', conference.loadFromMemberToken, controllers.meetings);

  return router;
};
