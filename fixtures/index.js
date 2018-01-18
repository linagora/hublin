/*eslint no-console: 0 */

const server = require('../config/db.json');
const mongoose = require('mongoose');
const async = require('async');

//
// Load all the fixtures and inject in all configuration resources.
// 1. Push the ../config files (local configuration, may be used in next steps)
// 2. Store the ESN configuration files into mongo
//
// Each configuration feature live in its module. On each module, index.js will be called and
// it is up to the index to copy/store/inject configuration at the rigth place.
//

/**
 * @param {function} done
 */
module.exports = done => {
  initMongoose();
  require('./esn-config')(err => {
    if (err) {
      console.log('[ERROR] Can not inject ESN config');
      console.log('[ERROR] ', err);
    }
    done(err);
  });
};

function initMongoose() {
  mongoose.connect(server.connectionString);
}
