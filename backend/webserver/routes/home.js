'use strict';

var express = require('express');

/**
 *
 * @param {hash} dependencies
 * @return {*}
 */
module.exports = function(dependencies) {

  var controllers = require('../controllers/home')(dependencies);
  var middlewares = require('../middlewares/home')(dependencies);
  var conference = require('../middlewares/conference')(dependencies);
  var user = require('../middlewares/user')(dependencies);

  var router = express.Router();

  // MEET-52 Keep this order, it is important here.
  router.get('/embed/button', controllers.embedButton);
  router.get('/analytics/:filename', controllers.embedAnalytics);
  router.get('/:id', middlewares.checkIdLength, middlewares.checkIdForCreation,
    middlewares.load, conference.lazyArchive(true), user.createForConference,
    conference.addUser, conference.createConference, controllers.liveconference);
  router.get('/', user.loadFromToken, conference.loadFromMemberToken, controllers.meetings);

  return router;
};
