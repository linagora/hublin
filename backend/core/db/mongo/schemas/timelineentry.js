'use strict';
var mongoose = require('mongoose'),
    tuple = require('../schemas/tuple'),
    Tuple = tuple.Tuple;

var TimelineEntrySchema = new mongoose.Schema({
  verb: {type: String},
  language: {type: String},
  published: {type: Date, default: Date.now},
  actor: {
    objectType: {type: String, required: true},
    _id: {type: String, required: true},
    image: {type: String},
    displayName: {type: String}
  },
  object: {
    objectType: {type: String},
    _id: {type: String, required: true}
  },
  target: [{
    objectType: {type: String},
    _id: {type: String, required: true}
  }],
  inReplyTo: [{
    objectType: {type: String},
    _id: {type: mongoose.Schema.ObjectId, required: true}
  }],
  to: {type: [Tuple], validate: [tuple.validateTuples, 'Bad to tuple']},
  bto: {type: [Tuple], validate: [tuple.validateTuples, 'Bad to tuple']}
});

/**
 * TimelineEntry mongoose Schema
 */
module.exports = TimelineEntrySchema;
