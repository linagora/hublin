'use strict';

const config = require('../esn-config');
const logger = require('../logger');

const scalabilityConfiguration = [{
    type: 'ws',
    url: ''
  }];

exports = module.exports = (conference, callback) => {
  config('scalability').get((err, config) => {
    let hosts = scalabilityConfiguration;

    if (err) {
      logger.warn('Can not get scalability configuration; will use the defaults.', err);
    } else if (!config) {
      logger.debug('No scalability configuration; will use the defaults.');
    } else {
      hosts = config.configuration;
    }

    conference.configuration.hosts && conference.configuration.hosts.push(...hosts);

    return callback(null, conference);
  });
};
