//'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    winston = require('winston'),
    fs = require('fs'),
    Event = mongoose.model('Event'),
    Dashboard = mongoose.model('Dashboard'),
    Product = mongoose.model('Product'),
    Metric = mongoose.model('Metric'),
    Testrun = mongoose.model('Testrun'),
    GatlingDetails = mongoose.model('GatlingDetails'),
    async = require('async'),
    Template = mongoose.model('Template'),
    Release = mongoose.model('Release'),
    TestrunSummary = mongoose.model('TestrunSummary'),
    RunningTest = mongoose.model('RunningTest'),
    testRunsModule = require('./testruns.server.controller'),
    jsonfile = require('jsonfile');

exports.updateTestRuns = updateTestRuns;

function updateTestRuns (req, res) {

  TestrunSummary.find({}, function (err, testRunSummaries) {

    _.each(testRunSummaries, function(testRunSummary){


      Testrun.findOne({testRunId: testRunSummary.testRunId}, function(err, testRun){

        if(testRun) {

          testRunSummary.meetsRequirement = testRun.meetsRequirement;
          testRunSummary.benchmarkResultFixedOK = testRun.benchmarkResultFixedOK;
          testRunSummary.benchmarkResultPreviousOK = testRun.benchmarkResultPreviousOK;

          testRun.hasSummary = true;

          testRun.save(function(err, savedTestRun){
          })


        }

        testRunSummary.annotations = (testRunSummary.annotations === 'None') ? undefined : testRunSummary.annotations;

        testRunSummary.save(function(err, savedTestRunSummary){
        })







      })

    })

    res.end('done!')

  });
}
