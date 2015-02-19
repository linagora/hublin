'use strict';

var mongoose = require('mongoose');

var HistorySchema = new mongoose.Schema({
  user: {type: mongoose.Schema.ObjectId, ref: 'User'},
  status: {type: String, required: true},
  context: {type: mongoose.Schema.Types.Mixed},
  date: {type: Date, default: Date.now}
}, {_id: false});

var AttendeeSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.ObjectId, ref: 'User'},
  status: {type: String, required: true}
}, {_id: false});

var ConferenceSchema = new mongoose.Schema({
  name: {type: String},
  status: {type: String},
  creator: {type: mongoose.Schema.ObjectId, ref: 'User'},
  timestamps: {
    creation: {type: Date, default: Date.now}
  },
  history: [HistorySchema],
  attendees: [AttendeeSchema],
  schemaVersion: {type: Number, default: 1}
});

/**
 * Conference mongoose Schema
 */
module.exports = mongoose.model('Conference', ConferenceSchema);
