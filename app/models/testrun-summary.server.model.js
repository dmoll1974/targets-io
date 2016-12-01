'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema, config = require('../../config/config');

var Mixed = Schema.Types.Mixed;

var data = new Schema({



});


var testRunSummaryMetricSchema = new Schema({
  'alias': String,
  'type': String,
  'tags': [{ text: String }],
  'dygraphData': {
    'annotations': [{
      attachAtBottom: Boolean,
      series: String,
      shortText: String,
      text: String,
      x: Number
    }],
    'data': [{ type: Mixed, default: []} ],
    'labels': [String],
    'legendData': [{
      avg: Number,
      id: Number,
      max: Number,
      min: Number,
      name: String,
      numberOfValidDatapoints: Number,
      visible: Boolean
    }],
    'graphNumberOfValidDatapoints': Number,
    'maxValue': Number
  },
  'unit': String,
  'includeInSummary': Boolean,
  'summaryText': String,
  'summaryIndex': Number,
  'targets': [String]
},
    {
      read: 'primary'
    });

mongoose.model('TestrunSummaryMetric', testRunSummaryMetricSchema);
/**
 * Testrun-summary Schema
 */
var TestrunSummarySchema = new Schema({
  'productName': {
    type: String,
    uppercase: true
  },
  'productRelease': {
    type: String,
    uppercase: true
  },
  'dashboardName': {
    type: String,
    uppercase: true
  },
  'dashboardDescription': {
    type: String

  },
  'goal': {
    type: String

  },'description': {
    type: String

  },
  'testRunId': {
    type: String,
    uppercase: true
  },
  'start': {
    type: Date
  },
  'end': Date,
  'buildResultsUrl': String,
  'buildResultsUrlDisplay': String,
  'humanReadableDuration': String,
  'meetsRequirement': Boolean,
  'benchmarkResultFixedOK': Boolean,
  'benchmarkResultPreviousOK': Boolean,
  'annotations': String,
  'metrics': [testRunSummaryMetricSchema],
   'markDown': {
        type: String,
        default: ''
   },
   'lastUpdated': Date,
  'requirements': [{
    metricAlias : String,
    requirementText : String,
    meetsRequirement : Boolean
  }]
},
    {
      read: 'primary'
    });

TestrunSummarySchema.pre('save', function (next) {
  this.model('Testrun').update({ testRunId: this.testRunId }, { $set: { 'hasSummary': true } } , next);
});

TestrunSummarySchema.pre('remove', function (next) {
  this.model('Testrun').update({ testRunId: this.testRunId }, { $set: { 'hasSummary': false } }, next);
});

TestrunSummarySchema.index({
  testRunId: 1,
  productName: 1,
  dashboardName: 1
}, { unique: true });
mongoose.model('TestrunSummary', TestrunSummarySchema);
