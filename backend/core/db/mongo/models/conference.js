'use strict';

var mongoose = require('mongoose'),
    TimelineEntrySchema = require('../schemas/timelineentry'),
    MemberSchema = require('../schemas/member');

var ConferenceSchema = new mongoose.Schema({
  _id: {type: String, required: true},
  active: {type: Boolean, default: true},
  createdFrom: {type: String, default: 'web'},
  timestamps: {
    created: {type: Date, default: Date.now},
    archived: {type: Date},
    closed: {type: Date}
  },
  history: [TimelineEntrySchema],
  members: [MemberSchema],
  schemaVersion: {type: Number, default: 1}
});

/**
 * Conference mongoose Schema
 */
module.exports = mongoose.model('Conference', ConferenceSchema);
