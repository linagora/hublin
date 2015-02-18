'use strict';

var LocalStrategy = require('passport-local').Strategy;

/**
 * @type {{name: string, strategy: LocalStrategy}}
 */
module.exports = {
  name: 'mongo',
  strategy: new LocalStrategy(require('../../core/auth/mongo').auth)
};
