'use strict';

var express = require('express');

/**
 * This router is responsible of the conferences API
 * @param {function} dependencies
 * @return {Router}
 */
module.exports = function(dependencies) {

  var controllers = require('../controllers/conferences')(dependencies);
  var middlewares = require('../middlewares/conference')(dependencies);
  var user = require('../middlewares/user');

  var router = express.Router();

  router.put('/api/conferences/:id', user.load, controllers.createAPI);

  router.put('/conferences/:id', user.load, controllers.create);
  router.get('/conferences', middlewares.loadFromMemberToken, controllers.redirect);
  router.get('/conferences/:id', middlewares.load, user.loadFromCookie, controllers.get);

  router.get('/api/conferences/:id/members', middlewares.loadWithAttendees, controllers.getAttendees);
  router.put('/api/conferences/:id/members', middlewares.load, user.loadFromCookie, middlewares.canAddMember, controllers.addMembers);

  return router;
};
