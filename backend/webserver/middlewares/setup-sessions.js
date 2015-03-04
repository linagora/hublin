'use strict';

var expressSession = require('express-session'),
    MongoStore = require('awesome-sessionstore')(expressSession),
    configuration = require('../../core/esn-config'),
    uuid = require('node-uuid'),
    mongoose = require('mongoose'),
    core = require('../../core'),
    mongo = core.db.mongo,
    mongotopic = core.pubsub.local.topic('mongodb:connectionAvailable'),
    mongosessiontopic = core.pubsub.local.topic('webserver:mongosessionstoreEnabled'),
    logger = core.logger;

/**
 *
 * @param {object} dependencies
 * @return {{setupSession: setupSession}}
 */
module.exports = function(dependencies) {

  function setupSession(session) {
    var setSession = function() {
      configuration('session').get(function(err, config) {
        config = config || {};
        logger.debug('mongo is connected, setting up mongo session store');
        session.setMiddleware(expressSession({
          cookie: { maxAge: config.remember || 6000000 },
          secret: config.secret || uuid.v4(),
          saveUninitialized: false,
          resave: false,
          store: new MongoStore({
            mongoose: mongoose
          })
        }));
        mongosessiontopic.publish({});
      });
    };

    if (mongo.isConnected()) {
      setSession();
    }
    mongotopic.subscribe(setSession);
  }

  return {
    setupSession: setupSession
  };
};
