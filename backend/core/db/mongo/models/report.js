'use strict';

var mongoose = require('mongoose'),
    Member = require('../schemas/member').Member,
    tuple = require('../schemas/tuple'),
    Tuple = tuple.Tuple;

var ReportSchema = new mongoose.Schema({
  timestamp: {created: Date},
  conference: {type: Tuple.tree},
  reporter: {type: Member.tree},
  reported: {type: Member.tree},
  members: [Member.tree],
  description: String
});

module.exports = mongoose.model('Report', ReportSchema);
