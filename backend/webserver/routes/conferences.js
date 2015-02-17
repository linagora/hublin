'use strict';

var express = require('express');

/**
 * This router is responsible of the conferences API
 * @param {function} dependencies
 * @return {Router}
 */
module.exports = function(dependencies) {

  var controllers = require('../controllers/conferences')(dependencies);
  var liveConferenceControllers = require('../controllers/live-conference')(dependencies);
  var middlewares = require('../middlewares/conference')(dependencies);

  var router = express.Router();

  router.get('/conferences/:id', liveConferenceControllers.open);
  router.get('/api/conferences/:id', middlewares.load, controllers.get);
  router.get('/api/conferences', controllers.list);
  router.post('/api/conferences', controllers.create);
  router.get('/api/conferences/:id/attendees', middlewares.loadWithAttendees, middlewares.canJoin, controllers.getAttendees);
  router.put('/api/conferences/:id/attendees', middlewares.load, middlewares.canJoin, controllers.updateAttendee);
  router.put('/api/conferences/:id/attendees/:user_id', middlewares.load, middlewares.canAddAttendee, controllers.addAttendee);

  return router;
};
