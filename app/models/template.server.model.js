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
  },
  'unit': {
    type: String,
    default: 'None'
  },
  'type': {
    type: String,
    default: 'Average'
  }
});

var TemplateVariableSchema = new mongoose.Schema({
  'name': {
    type: String,
    default: null
  },
  'placeholder': String,
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
  'variables':  [TemplateVariableSchema],
  'tags': {
    type: [{
      text: String,
      default: Boolean
    }],
    default: [
      {
        text: 'Load',
        default: true
      },
      {
        text: 'JVM',
        default: false
      },
      {
        text: 'Database',
        default: false
      },
      {
        text: 'CPU',
        default: false
      },
      {
        text: 'Frontend',
        default: false
      },
      {
        text: 'JDBC',
        default: false
      },
      {
        text: 'Garbage Collection',
        default: false
      },
      {
        text: 'Heap',
        default: false
      },
      {
        text: 'Sessions',
        default: false
      },
      {
        text: 'Threads',
        default: false
      }
    ]
  }
});
mongoose.model('Template', TemplateSchema);
