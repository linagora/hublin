'use strict';

var mongoose = require('mongoose');
var Report = mongoose.model('Report');

function create(report, callback) {
  (new Report(report)).save(callback);
}

module.exports = {
    create: create
};
