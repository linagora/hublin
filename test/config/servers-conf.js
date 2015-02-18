'use strict';

var tmp = 'tmp';

/**
 * @type {{tmp: string, mongodb: {cmd: (*|string), port: (*|number), interval_replica_set: (*|number), tries_replica_set: (*|number), replicat_set_name: string, dbname: string, dbpath: string, logpath: string}, redis: {cmd: (*|string), port: (*|number), conf_file: string, log_path: string, pwd: string}}}
 */
module.exports = {
  tmp: tmp,

  mongodb: {
    'cmd' : process.env.CMD_MONGODB || 'mongod',
    'port' : process.env.PORT_MONGODB || 23456,
    'interval_replica_set': process.env.MONGODB_INTERVAL_REPLICA_SET || 1000,
    'tries_replica_set': process.env.MONGODB_TRIES_REPLICA_SET || 20,
    'replicat_set_name' : 'rs',
    'dbname': 'meetings-test',
    'dbpath' : tmp + '/mongo/',
    'logpath' : ''
  },

  redis: {
    'cmd' : process.env.CMD_REDIS || 'redis-server',
    'port' : process.env.PORT_REDIS || 23457,
    'conf_file' : '',
    'log_path' : '',
    'pwd' : ''
  }
};
