'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema, config = require('../../config/config');

var testRunSummaryMetricSchema = new Schema({
  'alias': String,
  'type': String,
  'tags': [{ text: String }],
  'data': [],
  'legendData': [],
  'includeInSummary': Boolean,
  'summaryText': String,
  'summaryIndex': Number,
  'targets': [String]
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
  'dashboardName': {
    type: String,
    uppercase: true
  },
  'dashboardDescription': {
    type: String,

  },
  'goal': {
    type: String,

  },'description': {
    type: String,

  },
  'testRunId': {
    type: String,
    uppercase: true
  },
  'start': {
    type: Date,
  },
  'end': Date,
  'humanReadableDuration': String,
  'annotations': String,
  'metrics': [testRunSummaryMetricSchema],
  'requirements': [{
    metricAlias : String,
    requirementText : String,
    meetsRequirement : Boolean
  }]
});

TestrunSummarySchema.index({
  testRunId: 1,
  productName: 1,
  dashboardName: 1
}, { unique: true });
mongoose.model('TestrunSummary', TestrunSummarySchema);
