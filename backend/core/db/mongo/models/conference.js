'use strict';

var mongoose = require('mongoose'),
    conferenceBaseSchema = require('./conference-base'),
    extend = require('extend');

var conferenceJSON = extend(true, {}, conferenceBaseSchema);
conferenceJSON._id = {type: String, required: true};

var ConferenceSchema = new mongoose.Schema(conferenceJSON);

/**
 * Conference mongoose Schema
 */
module.exports = mongoose.model('Conference', ConferenceSchema);
