'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema, server = require('../../server');
/**
 * Dashboard Schema
 */
var dashboardSchema = new mongoose.Schema({
  'productId': {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  'name': {
    type: String,
    uppercase: true
  },
  'description': String,
  'goal': String,
  'metrics': [{
      type: Schema.Types.ObjectId,
      ref: 'Metric'
    }],
  'granularity': {
    type: Number,
    default: 15
  },
  'baseline': {
    type: String,
    default: null
  },
  'useInBenchmark': {
    type: Boolean,
    default: false
  },
  'includeRampUp':  {
    type: Boolean,
    default: false
  },
  'startSteadyState': Number,
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
dashboardSchema.pre('remove', function (next) {
  this.model('Product').update({ _id: this.productId }, { $pull: { dashboards: this._id } }, { multi: true }, next);
});
dashboardSchema.pre('save', function (next) {
  this.model('Product').update({ _id: this.productId }, { $addToSet: { dashboards: this._id } }, next);
});
dashboardSchema.index({
  name: 1,
  productId: 1
}, { unique: true });
db.model('Dashboard', dashboardSchema);
