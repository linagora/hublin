'use strict';

var LocalStrategy = require('passport-local').Strategy;

/**
 * @type {{name: string, strategy: LocalStrategy}}
 */
module.exports = {
  name: 'local',
  strategy: new LocalStrategy(require('../../core/auth/file').auth)
};
