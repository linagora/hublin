'use strict';

var server = require('./config/data/db.json');
var mongoose = require('mongoose');
var async = require('async');

//
// Load all the fixtures and inject in all configuration resources.
// 1. Push the ../config files (local configuration, may be used in next steps)
// 2. Store the ESN configuration files into mongo
//
// Each configuration feature live in its module. On each module, index.js will be called and
// it is up to the index to copy/store/inject configuration at the rigth place.
//

function initMongoose() {
  mongoose.connect(server.connectionString);
}

/**
 * @param {function} done
 */
module.exports = function(done) {
  require('./config')(function(err) {
    if (err) {
      // aborting, we may not be able to load other fixtures if the database has not been configured
      console.log('[ERROR] Can not load config fixtures, aborting...');
      console.log('[ERROR] ', err);
      if (done) {
        return done(err);
      }
    } else {
      initMongoose();
      async.parallel([
        function(callback) {
          require('./esn-config')(function(err) {
            if (err) {
              console.log('[ERROR] Can not inject ESN config');
              console.log('[ERROR] ', err);
            }
            callback(err);
          });
        },
        function(callback) {
          require('./deployments')(function(err) {
            if (err) {
              console.log('[ERROR] Can not deploy fixtures');
              console.log('[ERROR] ', err);
            }
            callback(err);
          });
        }
      ], function(err) {
        return done(err);
      });
    }
  });
};
