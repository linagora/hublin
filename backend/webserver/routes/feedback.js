'use strict';

var express = require('express');

module.exports = function(dependencies) {

  var router = express.Router(),
      controllers = require('../controllers/feedback')(dependencies);

  router.post('/api/feedback', controllers.sendFeedbackMail);

  return router;

};
