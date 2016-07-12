/*jshint maxerr: 10000 */
'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    dashboard = require('./dashboards.server.controller'),
    TestrunSummary = mongoose.model('TestrunSummary'),
    Testrun = mongoose.model('Testrun'),
    Dashboard = mongoose.model('Dashboard'),
    Product = mongoose.model('Product'),
    _ = require('lodash'),
    Utils = require('./utils.server.controller'),
    Jenkins = require('./jenkins.server.controller'),
    GatlingDetails = mongoose.model('GatlingDetails');





exports.get = getTestrunSummary;
exports.create = createTestrunSummary;
exports.update = updateTestrunSummary;
exports.delete = deleteTestrunSummary;
//exports.testRunsForProductRelease = testRunsForProductRelease;

/**
 * select test runs for product release
 */
//function testRunsForProductRelease(req, res) {
//
//  TestrunSummary.find({$and:[{productName: req.params.productName}, {productRelease: req.query.release}]}).sort({eventTimestamp: 1}).exec(function (err, testRuns) {
//    if (err) {
//      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
//    } else {
//
//      //_.each(testRuns, function(testRun, i){
//      //
//      //  testRuns[i].humanReadableDuration = humanReadbleDuration(testRun.end.getTime() - testRun.start.getTime());
//      //
//      //});
//
//      res.jsonp(testRuns);
//
//    }
//  });
//}


function getTestrunSummary (req, res){

  var response = {};

  TestrunSummary.findOne({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName },
      { testRunId: req.params.testRunId }
    ]
  }).exec(function (err, testRunSummary) {

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {

      if(testRunSummary) {


        Testrun.findOne({
          $and: [
            {productName: req.params.productName},
            {dashboardName: req.params.dashboardName},
            {testRunId: req.params.testRunId}
          ]
        }).exec(function (err, testRun) {

          /* if test run summary is based on the latest stored test run, return it */
          if (testRunSummary.lastUpdated && testRunSummary.lastUpdated > testRun.lastUpdated) {

            response.testRunSummary = testRunSummary;
            response.hasBeenUpdated = false;


            res.jsonp(response);
            /* otherwise update the test run summary bases on the latest stored test run */
          } else {

            updateTestrunSummaryBasedOnTestRun(testRunSummary, testRun, function(updatedTestRunSummary){

              response.testRunSummary = updatedTestRunSummary;
              response.hasBeenUpdated = true;

              res.jsonp(response);
            });

          }


        })
      }else{

        response.testRunSummary = undefined;
        res.jsonp(response);

      }
    }
  })
}


function updateTestrunSummaryBasedOnTestRun(testRunSummary, testRun, callback){

  var updatedTestRunSummary = _.clone(testRunSummary);
  updatedTestRunSummary.metrics = [];

  dashboard.getDashboard (testRun.productName, testRun.dashboardName)
  .then(function(dashboard){

        var testRunMetricsToIncludeInTestRunSummary = dashboard.metrics.filter(function(metric){
          if (metric.includeInSummary === true) return metric;
        });

    /* synchronise metrics included in test run summary*/


        _.each(testRunSummary.metrics, function(testRunSummaryMetric){

          _.each(testRunMetricsToIncludeInTestRunSummary, function(testRunMetric){

              if(testRunSummaryMetric._id.toString() === testRunMetric._id.toString()) updatedTestRunSummary.metrics.push(testRunSummaryMetric);

          })
        })

        _.each(testRunMetricsToIncludeInTestRunSummary, function(testRunMetric){

            var index = updatedTestRunSummary.metrics.map(function(metric){return metric._id;}).indexOf(testRunMetric._id);
            if (index === -1) updatedTestRunSummary.metrics.push(testRunMetric);

        })

        /* set requirements */

        var testRunMetricsWithRequirements = testRun.metrics.filter(function(metric){
          if (metric.meetsRequirement !== null) return metric;
        });

        _.each(testRunMetricsWithRequirements, function(testRunMetric){

          var requirementText =  testRunMetric.requirementOperator == "<" ? testRunMetric.alias + ' should be lower than ' + testRunMetric.requirementValue : testRunMetric.alias + ' should be higher than ' + testRunMetric.requirementValue;

          var tag = testRunMetric.tags.length > 0 ? testRunMetric.tags[0].text : 'All';

          updatedTestRunSummary.requirements.push({metricAlias: testRunMetric.alias, tag: tag, requirementText: requirementText, meetsRequirement:testRunMetric.meetsRequirement });

        });

      callback(updatedTestRunSummary);

  });
}

function createTestrunSummary(req, res){

  var testRunSummary = new TestrunSummary(req.body);

  testRunSummary.lastUpdated = new Date().getTime();

  testRunSummary.save(function(err, savedTestRunSummary){

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(savedTestRunSummary);

      /* if GatlingDetails have not been persisted yet, do it now!*/
      GatlingDetails.findOne({consoleUrl: savedTestRunSummary.buildResultsUrl }, function(err, GatlingDetailsResponse) {

        if (!GatlingDetailsResponse) {


          Jenkins.getJenkinsData(savedTestRunSummary.buildResultsUrl, false, savedTestRunSummary.start, savedTestRunSummary.end, function (response) {

            if(response.status === 'fail') {

              console.log('Persisting of Gatling data failed due to: ' + response.data.message);

            }
          });
        }

      });

    }
  });
}

function updateTestrunSummary(req, res){


    TestrunSummary.findOne({$and:[
      {productName: req.body.productName},
      {dashboardName: req.body.dashboardName},
      {testRunId: req.body.testRunId}
    ]}).exec(function(err, testRunSummary){

      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else{

        testRunSummary.annotations = req.body.annotations;
        testRunSummary.metrics = req.body.metrics;
        testRunSummary.markDown = req.body.markDown;
        testRunSummary.lastUpdated = req.body.lastUpdated;

        testRunSummary.save(function(err, savedTestRunSummary){

          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          } else {

            res.jsonp(savedTestRunSummary);

          }
        });
      }

    })

}

function deleteTestrunSummary (req, res){

  TestrunSummary.remove({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName },
      { testRunId: req.params.testRunId }
    ]
  }).exec(function (err, testRunSummary) {

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(testRunSummary);
    }
  })

}
