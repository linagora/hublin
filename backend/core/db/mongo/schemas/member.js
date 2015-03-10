'use strict';

var mongoose = require('mongoose');
var uuid = require('node-uuid');

var MemberSchema = new mongoose.Schema({
  objectType: {type: String, required: true},
  id: {type: mongoose.Schema.Types.Mixed, required: true},
  token: {type: String, default: uuid.v4},
  displayName: {type: String, required: true},
  status: {type: String, required: true, default: 'offline'},
  connection: {
    ipAddress: {type: String},
    userAgent: {type: String}
  }
});

/**
 * Member mongoose Schema
 */
module.exports = MemberSchema;
module.exports.Member = MemberSchema;
