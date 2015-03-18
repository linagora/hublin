'use strict';

var mongoose = require('mongoose'),
    Member = require('../schemas/member').Member;

var ReportSchema = new mongoose.Schema({
  timestamp: {created: Date},
  conference: {type: mongoose.Schema.Types.Mixed},
  reporter: {type: Member.tree},
  reported: {type: Member.tree},
  members: [Member.tree],
  description: String
});

module.exports = mongoose.model('Report', ReportSchema);
