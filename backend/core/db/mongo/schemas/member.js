'use strict';

var mongoose = require('mongoose');

var Member = new mongoose.Schema({
  objectType: {type: String, required: true},
  id: {type: mongoose.Schema.Types.Mixed, required: true},
  displayName: {type: String, required: true},
  status: {type: String, required: true, default: 'offline'},
  connection: {
    ipAddress: {type: String},
    userAgent: {type: String}
  }
});
module.exports.Member = Member;
