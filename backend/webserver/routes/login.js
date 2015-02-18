'use strict';

var express = require('express');

/**
 * This router is responsible of the conferences API
 * @param {function} dependencies
 * @return {Router}
 */
module.exports = function(dependencies) {

  var controllers = require('../controllers/login')(dependencies);
  var cookielifetime = require('../middlewares/cookie-lifetime');

  var router = express.Router();

  router.get('/login', controllers.index);
  router.post('/login', cookielifetime.set, controllers.login);

  return router;
};
