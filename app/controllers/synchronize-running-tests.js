'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var chalk = require('chalk');
var config = require('../../config/config');




/**
 * Running test Schema
 */
var RunningTestSchema = new mongoose.Schema({
  'testRunId': String,
  'start': {
    type: Date,
    default: Date.now
  },
  'end': {
    type: Date
  },
  'keepAliveTimestamp': {
    type: Date,
    default: Date.now
  },
  'completed': {
    type: Boolean,
    default: false
  },
  'productName': String,
  'dashboardName': String

});

RunningTestSchema.index({
  testRunId: 1,
  productName: 1,
  dashboardName: 1

}, { unique: true });


mongoose.model('RunningTest', RunningTestSchema);

var testRunTargetSchema = new Schema({
  'meetsRequirement': Boolean,
  'benchmarkResultFixedOK': Boolean,
  'benchmarkResultPreviousOK': Boolean,
  'target': String,
  'value': Number,
  'benchmarkPreviousValue': Number,
  'benchmarkFixedValue': Number
});
mongoose.model('TestrunTarget', testRunTargetSchema);
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
mongoose.model('TestrunMetric', testRunMetricSchema);
/**
 * Testrun Schema
 */
var TestrunSchema = new Schema({
  'productName': {
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
mongoose.model('Testrun', TestrunSchema);


var db = mongoose.connect(process.env.mongoUrl, function(err) {
  if (err) {
    console.error(chalk.red('Could not connect to MongoDB!'));
    console.log(chalk.red(err));
  }
});

var RunningTest = mongoose.model('RunningTest');
var Testrun = mongoose.model('Testrun');


  /* start polling every minute */
  setInterval(synchronizeRunningTestRuns, 60 * 1000);




function synchronizeRunningTestRuns () {


  var dateNow = new Date().getTime();


  /* Get  running tests */

  RunningTest.find().exec(function (err, runningTests) {

    console.log('checking running tests');

    _.each(runningTests, function (runningTest) {

            /* if keep alive is older than 16 seconds, save running test in test run collection and remove from running tests collection */
            if (dateNow - runningTest.keepAliveTimestamp.getTime() > 16 * 1000){

              /* mark test as not completed */
              runningTest.completed = false;

              saveTestRun(runningTest)
                  .then(function(){

                  });
            }

          });

  });
}


let saveTestRun = function (runningTest){

  return new Promise((resolve, reject) => {

    let testRun = new Testrun({

      productName: runningTest.productName,
      dashboardName: runningTest.dashboardName,
      testRunId: runningTest.testRunId,
      start: runningTest.start,
      end: runningTest.end,
      completed: runningTest.completed,
      humanReadableDuration: humanReadbleDuration(runningTest.end.getTime() - runningTest.start.getTime())

    });


    testRun.save(function (err, savedTestRun) {

      if (err) {
        reject(err);
      } else {

        runningTest.remove(function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(savedTestRun);
          }
        });
      }
    });

  });
}

function humanReadbleDuration(durationInMs){

  var date = new Date(durationInMs);
  var readableDate = '';
  if(date.getUTCDate()-1 > 0) readableDate += date.getUTCDate()-1 + " days, ";
  if(date.getUTCHours() > 0) readableDate += date.getUTCHours() + " hours, ";
  readableDate += date.getUTCMinutes() + " minutes";
  return readableDate;
}
