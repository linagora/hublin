'use strict';

const TimelineEntrySchema = require('../schemas/timelineentry');
const MemberSchema = require('../schemas/member');
const HostSchema = require('../schemas/host');

const conferenceBaseSchema = {
  active: {type: Boolean, default: true},
  createdFrom: {type: String, default: 'web'},
  roomId: {type: Number, unique: true},
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
