'use strict';

var mongoose = require('mongoose');

var ICON_OBJECT_TYPE = ['icon', 'url'];
module.exports.ICON_OBJECT_TYPE = ICON_OBJECT_TYPE;

var TARGET_OBJECT_TYPE = ['user', 'community'];
module.exports.TARGET_OBJECT_TYPE = TARGET_OBJECT_TYPE;

var Tuple = new mongoose.Schema({
  objectType: {type: String, required: true},
  id: {type: mongoose.Schema.Types.Mixed, required: true}
}, {_id: false});
module.exports.Tuple = Tuple;

function validateTuple(tuple) {
  if (!tuple) { return true; }
  if (! ('objectType' in tuple)) { return false; }
  if (! ('id' in tuple)) { return false; }
  if (typeof tuple.objectType !== 'string') { return false; }
  return true;
}
module.exports.validateTuple = validateTuple;

function validateTuples(tuples) {
  if (!tuples) { return true; }
  for (var i = 0, len = tuples.length; i < len; i++) {
    if (!validateTuple(tuples[i])) {
      return false;
    }
  }
  return true;
}
module.exports.validateTuples = validateTuples;

function validateIconTuple(value) {
  if (!value) { return true;}
  return (ICON_OBJECT_TYPE.indexOf(value.objectType) >= 0);
}
module.exports.validateIconTuple = validateIconTuple;

function validateTargetTuples(value) {
  for (var i = 0, len = value.length; i < len; i++) {
    if (TARGET_OBJECT_TYPE.indexOf(value[i].objectType) < 0) {
      return false;
    }
  }
  return true;
}
module.exports.validateTargetTuples = validateTargetTuples;
