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
  'tags': [{ text: String }],
  'benchmarkValue': {
    type: Number,
    default: null
  },
  'benchmarkOperator': {
    type: String,
    default: null
  },
  'requirementValue': {
    type: Number,
    default: null
  },
  'requirementOperator': {
    type: String,
    default: null
  }
});

var TemplateVariableSchema = new mongoose.Schema({
  'name': {
    type: String,
    default: null
  },
  'description': String,
  'query': {
    type: String,
    default: null
  }

});

mongoose.model('TemplateVariable', TemplateVariableSchema);

var TemplateSchema = new Schema({
  'name': {
    type: String,
    uppercase: true
  },
  'description': String,
  'metrics':  [templateMetricSchema],
  'variables':  [TemplateVariableSchema]

});
mongoose.model('Template', TemplateSchema);
