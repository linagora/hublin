'use strict';

var tmp = 'tmp';

/**
 * @type {{tmp: string, mongodb: {cmd: (*|string), port: (*|number), interval_replica_set: (*|number), tries_replica_set: (*|number), replicat_set_name: string, dbname: string, dbpath: string, logpath: string}, redis: {cmd: (*|string), port: (*|number), conf_file: string, log_path: string, pwd: string}}}
 */
module.exports = {
  tmp: tmp,

  redis: {
    host: 'localhost',
    port: 6379,
    url: `redis://${process.env.HUBLIN_REDIS_HOST || 'redis'}:6379`
  },

  mongodb: {
    host: 'mongo',
    port: 27017,
    dbName: 'tests',
    connectionString: `mongodb://${process.env.HUBLIN_MONGO_HOST || 'mongo'}:27017/tests`
  }
};
