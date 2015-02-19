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

  router.get('/api/conferences/:id', middlewares.load, controllers.get);
  router.get('/api/conferences', controllers.list);
  router.post('/api/conferences', user.create, controllers.create);
  router.get('/api/conferences/:id/attendees', middlewares.loadWithAttendees, controllers.getAttendees);
  router.put('/api/conferences/:id/attendees', middlewares.load, user.create, controllers.updateAttendee);
  router.put('/api/conferences/:id/attendees/:user_id', middlewares.load, controllers.addAttendee);

  return router;
};
