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
  var setupSettingsMiddleware = require('../middlewares/setup-settings');
  var user = require('../middlewares/user')(dependencies);
  var should = require('../middlewares/should')(dependencies);

  var router = express.Router();

  router.get('/api/conferences/:id', middlewares.load, middlewares.lazyArchive(false), controllers.get);
  router.put('/api/conferences/:id', middlewares.checkIdLength, middlewares.checkIdForCreation,
             middlewares.load, middlewares.lazyArchive(true),
             user.createForConference, middlewares.addUser,
             middlewares.createConference, setupSettingsMiddleware, controllers.finalizeCreation);
  router.get('/api/conferences/:id/members', middlewares.load, controllers.getMembers);
  router.put('/api/conferences/:id/members',
             middlewares.load, should.beInRequest('conference'),
             user.loadForConference, should.beInRequest('conference'),
             middlewares.canAddMember, setupSettingsMiddleware, controllers.addMembers);
  router.put('/api/conferences/:id/members/:mid/:field',
             middlewares.load, should.beInRequest('conference'),
             user.loadForConference, should.beInRequest('user'),
             middlewares.canUpdateUser,
             controllers.updateMemberField);
  router.post('/api/conferences/:id/reports', middlewares.load, should.beInRequest('conference'),
              user.loadForConference, controllers.createReport);

  return router;
};
