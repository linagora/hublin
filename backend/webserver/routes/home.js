'use strict';

var express = require('express');

module.exports = function(dependencies) {

  var controllers = require('../controllers/home')(dependencies);

  var router = express.Router();
  router.get('/', controllers.index);
  router.get('/app', controllers.app);

  return router;
};
