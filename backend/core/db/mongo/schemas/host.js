'use strict';

var mongoose = require('mongoose');

var HostSchema = new mongoose.Schema({
  _id: false,
  url: {type: String},
  type: {type: String, required: true, enum: ['ws', 'stun', 'turn']},
  username: {type: String},
  password: {type: String}
});

module.exports = HostSchema;
