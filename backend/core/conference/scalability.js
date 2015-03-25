'use strict';

var config = require('../esn-config'),
    logger = require('../logger');

var defaultConfiguration = [
  {
    type: 'ws',
    url: ''
  }
];

exports = module.exports = function scale(conference, callback) {
  config('scalability').get(function(err, config) {
    var hosts = defaultConfiguration;

    if (err) {
      logger.warn('Can not get scalability configuration; will use the defaults.', err);
    } else if (!config) {
      logger.debug('No scalability configuration; will use the defaults.');
    } else {
      hosts = config;
    }

    conference.configuration = {
      hosts: hosts
    };

    return callback(null, conference);
  });
};
