'use strict';

var mongoconfig = require('mongoconfig');
var mongoose = require('mongoose');
mongoconfig.setDefaultMongoose(mongoose);

/**
 * @type {proxy|exports}
 */
module.exports = mongoconfig;
