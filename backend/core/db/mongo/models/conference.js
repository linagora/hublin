'use strict';

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const conferenceBaseSchema = require('./conference-base');
const extend = require('extend');

autoIncrement.initialize(mongoose);

const conferenceJSON = extend(true, {}, conferenceBaseSchema);

conferenceJSON._id = {type: String, required: true};

const ConferenceSchema = new mongoose.Schema(conferenceJSON);

ConferenceSchema.plugin(autoIncrement.plugin, { model: 'Conference', field: 'roomId' });

/**
 * Conference mongoose Schema
 */
module.exports = mongoose.model('Conference', ConferenceSchema);
