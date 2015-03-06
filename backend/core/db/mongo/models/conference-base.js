'use strict';

var TimelineEntrySchema = require('../schemas/timelineentry'),
    MemberSchema = require('../schemas/member'),
    HostSchema = require('../schemas/host');

var conferenceBaseSchema = {
  active: {type: Boolean, default: true},
  createdFrom: {type: String, default: 'web'},
  timestamps: {
    created: {type: Date, default: Date.now},
    archived: {type: Date},
    closed: {type: Date}
  },
  history: [TimelineEntrySchema],
  members: [MemberSchema],
  configuration: {
    hosts: [HostSchema]
  },
  schemaVersion: {type: Number, default: 1}
};

/**
 * base schema for conferences
 *
 * shared by conferences and archived conferences
 */
module.exports = conferenceBaseSchema;
