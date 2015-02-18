'use strict';

/**
 * @param {function} done
 */
module.exports = function(done) {
  console.log('[INFO] Deploying fixtures');
  require('./users/users')(done);
};
