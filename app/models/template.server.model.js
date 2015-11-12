'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema, config = require('../../config/config');

var templateMetricSchema = new mongoose.Schema({
  'alias': {
    type: String,
    default: null
  },
  'targets': [String],
  'tags': [{ text: String }]
});

var templateVariableSchema = new mongoose.Schema({
  'name': {
    type: String,
    default: null
  },
  'query': {
    type: String,
    default: null
  }

});


mongoose.model('TestrunTarget', testRunTargetSchema);
var templateSchema = new Schema({
  'name': {
    type: String,
    uppercase: true
  },
  'description': String,
  'metrics':  [templateMetricSchema],
  'variables':  [templateVariableSchema]

});
mongoose.model('Template', TemplateSchema);
