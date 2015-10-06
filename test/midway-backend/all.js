'use strict';

var mockery = require('mockery'),
    path = require('path'),
    fs = require('fs-extra'),
    helpers = require('../helpers'),
    testConfig = require('../config/servers-conf.js');

before(function(done) {
  process.env.NODE_ENV = 'test';
  var basePath = path.resolve(__dirname + '/../..');
  var tmpPath = path.resolve(basePath, testConfig.tmp);
  this.testEnv = {
    serversConfig: testConfig,
    basePath: basePath,
    tmp: tmpPath,
    fixtures: path.resolve(__dirname + '/fixtures'),
    mongoUrl: 'mongodb://localhost:' + testConfig.mongodb.port + '/' + testConfig.mongodb.dbname,
    writeDBConfigFile: function() {
      fs.writeFileSync(tmpPath + '/db.json', JSON.stringify({connectionString: 'mongodb://localhost:' + testConfig.mongodb.port + '/' + testConfig.mongodb.dbname, connectionOptions: {auto_reconnect: false}}));
    },
    removeDBConfigFile: function() {
      fs.unlinkSync(tmpPath + '/db.json');
    },
    initCore: function(callback) {
      var core = require(basePath + '/backend/core');
      core.init(function() {
        if (callback) {
          process.nextTick(callback);
        }
      });
      return core;
    },
    initRedisConfiguration: function(mongoose, callback) {
      var configuration = require('mongoconfig');
      configuration.setDefaultMongoose(mongoose);
      mongoose.connect(this.mongoUrl);

      mongoose.connection.on('open', function() {
        configuration('redis').store({
          host: 'localhost',
          port: testConfig.redis.port
        }, function(err) {
          if (err) {
            console.log('Error while saving redis configuration', err);
            return callback(err);
          }
          return callback();
        });
      });
    }
  };
  this.helpers = {};
  helpers(this.helpers, this.testEnv);
  process.env.NODE_CONFIG = this.testEnv.tmp;
  process.env.NODE_ENV = 'test';

  fs.copySync(this.testEnv.fixtures + '/default.json', this.testEnv.tmp + '/default.json');
  this.mongoose = require('mongoose');
  this.testEnv.initRedisConfiguration(this.mongoose, done);
});

after(function(done) {
  this.mongoose.disconnect(done);
});

beforeEach(function() {
  mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
  this.testEnv.writeDBConfigFile();
});

afterEach(function() {
  try {
    this.helpers.requireBackend('core/db/mongo/file-watcher').clear();
    this.testEnv.removeDBConfigFile();
  } catch (e) {}
  mockery.resetCache();
  mockery.deregisterAll();
  mockery.disable();
});
