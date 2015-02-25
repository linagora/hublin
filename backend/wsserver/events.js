'use strict';

/**
 * @param {Function} dependencies
 * @return {{init: Function, events: {conferences: (module.exports|exports)}}}
 */
module.exports = function(dependencies) {

  var logger = dependencies('logger');
  var conferences = require('./notification/conference')(dependencies);
  var events = {
    conferences: conferences
  };

  var init = function(io) {
    io.on('connection', function(socket) {
      logger.info('Got a connection in the events module on socket');
    });
    conferences.init(io);
  };

  return {
    init: init,
    events: events
  };
};
