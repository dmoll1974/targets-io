'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema, config = require('../../config/config');
var testRunTargetSchema = new Schema({
  'meetsRequirement': Boolean,
  'benchmarkResultFixedOK': Boolean,
  'benchmarkResultPreviousOK': Boolean,
  'target': String,
  'value': Number,
  'benchmarkPreviousValue': Number,
  'benchmarkFixedValue': Number
});

var testRunMetricSchema = new Schema({
  'alias': String,
  'type': String,
  'tags': [{ text: String }],
  'requirementOperator': String,
  'requirementValue': String,
  'benchmarkOperator': String,
  'benchmarkValue': String,
  'meetsRequirement': {
    type: Boolean,
    default: null
  },
  'benchmarkResultFixedOK': {
    type: Boolean,
    default: null
  },
  'benchmarkResultPreviousOK': {
    type: Boolean,
    default: null
  },
  'annotation': String,
  'targets': [testRunTargetSchema]

});
/**
 * Testrun Schema
 */
var TestrunSchema = new Schema({
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
  'testRunId': {
    type: String,
    uppercase: true
  },
  'start': {
    type: Date,
    expires: config.graphiteRetentionPeriod
  },
  'end': Date,
  'baseline' : {
  type: String,
  default: null
  },
  'previousBuild': {
    type: String,
    default: null
  },
  'completed': {
    type: Boolean,
    default: true
  },
  'humanReadableDuration': String,
  'meetsRequirement': Boolean,
  'benchmarkResultFixedOK': Boolean,
  'benchmarkResultPreviousOK': Boolean,
  'buildResultsUrl': String,
  'annotations': String,
  'rampUpPeriod': {
      type: Number
  },
  'metrics': [testRunMetricSchema]
}, { toObject: { getters: true } });

TestrunSchema.virtual('startEpoch').get(function () {
  return this.start.getTime();
});
TestrunSchema.virtual('endEpoch').get(function () {
  return this.end.getTime();
});
TestrunSchema.index({
  testRunId: 1,
  dashboardId: 1
}, { unique: true });



TestrunSchema.post('save', function (testRun) {

  var TestRunCache = cacheDb.model('TestRunCache')

    Testrun.find({
      $and: [
        {productName: testRun.productName},
        {name: testRun.dashboardName}
      ]
    }).sort({end: -1 }).exec(function (err, testRuns) {

      if(err)
        console.log(err);
      else{

        if(testRuns.length > 0) {

          var key = testRun.productName + testRun.dashboardName;

          TestRunCache.findOneAndUpdate({key: key},
              {
                value: testRuns,
                created: new Date()
              },
              {upsert: true}, function (err, testRunCacheItem) {

                if(err)
                  console.log(err);
                else
                  console.log('test run cache updated');
              })
        }
      }

    })

});

db.model('Testrun', TestrunSchema);
