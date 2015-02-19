'use strict';

var emailAddresses = require('email-addresses');
var mongoose = require('mongoose');
var trim = require('trim');

function validateEmail(email) {
  return emailAddresses.parseOneAddress(email) !== null;
}

function validateEmails(emails) {
  if (!emails || !emails.length) {
    return false;
  }
  var valid = true;
  emails.forEach(function(email) {
    if (!validateEmail(email)) {
      valid = false;
    }
  });
  return valid;
}

var UserSchema = new mongoose.Schema({
  emails: {type: [String], required: true, unique: true, validate: validateEmails},
  displayName: {type: String, trim: true},
  timestamps: {
    creation: {type: Date, default: Date.now}
  },
  schemaVersion: {type: Number, default: 1}
});

UserSchema.pre('save', function(next) {
  var user = this;

  user.emails = user.emails.map(function(email) {
    return trim(email).toLowerCase();
  });

  next();
});

/**
 * User mongoose Schema
 */
module.exports = mongoose.model('User', UserSchema);
