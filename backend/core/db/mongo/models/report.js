'use strict';

var mongoose = require('mongoose'),
    Member = require('../schemas/member').Member;

var ReportSchema = new mongoose.Schema({
  timestamp: {created: Date},
  reporter: {type: Member.tree},
  reported: {type: Member.tree},
  members: [Member],
  description: String
});

module.exports = mongoose.model('Report', ReportSchema);
