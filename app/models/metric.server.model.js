'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema;

var CounterSchema = Schema({
  _id: {type: String, required: true},
  seq: { type: Number, default: 0 }
});

var Counter = mongoose.model('Counter', CounterSchema);


/**
 * Metric Schema
 */
var metricSchema = new mongoose.Schema({
  'dashboardId': {
    type: Schema.Types.ObjectId,
    ref: 'Dashboard'
  },
  'dashboardName': String,
  'productName': String,
  'alias': {
    type: String,
    default: null
  },
  'targets': [String],
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
  'tags': [{
    text: String,
    index: {
      type: Number,
      default: null
    }

  }],
  'type': {
    type: String,
    default: 'Average'
  },
  'includeInSummary':{
    type: Boolean,
    default: false
  },
  'defaultSummaryText': String,
  'summaryIndex': Number,
  'unit': {
    type: String,
    default: 'None'
  },
  'lastUpdated': Date

    },
    {
      read: 'primary'
    });

metricSchema.pre('remove', function (next) {
  this.model('Dashboard').update({ _id: this.dashboardId }, { $pull: { metrics: this._id } }, { multi: true }, next);
});
metricSchema.pre('save', function (next) {
  this.model('Dashboard').update({ _id: this.dashboardId }, { $addToSet: { metrics: this._id } }, next);
});




mongoose.model('Metric', metricSchema);
