/*jshint maxerr: 10000 */
'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    winston = require('winston'),
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
exports.getTestRunSummaryForRelease = getTestRunSummaryForRelease;
exports.getTestRunSummariesForRelease = getTestRunSummariesForRelease;
exports.getTestRunSummaryReleasesForProduct = getTestRunSummaryReleasesForProduct;
exports.create = createTestrunSummary;
exports.update = updateTestrunSummary;
exports.delete = deleteTestrunSummary;



function getTestRunSummaryReleasesForProduct (req, res) {

  var response = {};

  TestrunSummary.find({productName: req.params.productName}).distinct('productRelease').exec(function (err, releases) {

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(releases);
    }
  });
}

function getTestRunSummariesForRelease (req, res) {

  var response = {};

  TestrunSummary.find({$and:[
                              {productName: req.params.productName},
                              {testRunId: {$in: req.body.testRunIds}}
  ]}).exec(function (err, testRunSummaries) {

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(testRunSummaries);
    }
  });
}
function getTestRunSummaryForRelease (req, res) {

  var response = {};

  TestrunSummary.findOne({
    $and: [
      {productName: req.params.productName},
      {dashboardName: req.params.dashboardName},
      {testRunId: req.params.testRunId}
    ]
  }).exec(function (err, testRunSummary) {

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(testRunSummary);
    }
  });
}

function getTestrunSummary (req, res){

  var response = {};

  TestrunSummary.findOne({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName },
      { testRunId: req.params.testRunId.toUpperCase() }
    ]
  }).exec(function (err, testRunSummary) {

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {

      if(testRunSummary) {

        dashboard.getDashboard (testRunSummary.productName, testRunSummary.dashboardName)
        .then(function(dashboard){

          if(!testRunSummary.lastUpdated || new Date(testRunSummary.lastUpdated).getTime() < new Date(dashboard.lastUpdated).getTime()) {

            winston.info('Dashboard last update date ' + new Date(dashboard.lastUpdated) + ' > test run summary last update date ' + new Date(testRunSummary.lastUpdated) );
            Testrun.findOne({
              $and: [
                {productName: testRunSummary.productName},
                {dashboardName: testRunSummary.dashboardName},
                {testRunId: testRunSummary.testRunId}
              ]
            }).exec(function (err, testRun) {

              /* only update when test run still exists! */
              if (testRun) {
                updateTestrunSummaryBasedOnMetrics(testRunSummary)
                    .then(updateRequirements)
                    .then(function (updatedTestRunSummary) {

                      response.testRunSummary = updatedTestRunSummary;
                      response.hasBeenUpdated = true;

                      res.jsonp(response);
                    });
              } else {

                response.testRunSummary = testRunSummary;
                response.hasBeenUpdated = false;

                res.jsonp(response);

              }
            });

          }else{

            response.testRunSummary = testRunSummary;
            response.hasBeenUpdated = false;

            res.jsonp(response);

          }

        })



      }else{

        response.testRunSummary = undefined;
        res.jsonp(response);

      }
    }
  })
}


function updateTestrunSummaryBasedOnMetrics(testRunSummary){

  return new Promise((resolve, reject) => {


    var updatedTestRunSummary = new TestrunSummary(testRunSummary);

    updatedTestRunSummary.metrics = [];
    updatedTestRunSummary._id = testRunSummary._id;

    dashboard.getDashboard (testRunSummary.productName, testRunSummary.dashboardName)
    .then(function(dashboard){

          var metricsToIncludeInTestRunSummary = dashboard.metrics.filter(function(metric){
            if (metric.includeInSummary === true) return metric;
          });

      /* synchronise metrics included in test run summary*/


          _.each(testRunSummary.metrics, function(testRunSummaryMetric){

            _.each(metricsToIncludeInTestRunSummary, function(includeMetric){

                if(testRunSummaryMetric._id.toString() === includeMetric._id.toString()) {

                  updatedTestRunSummary.metrics.push(updateTestRunSummaryMetric(testRunSummaryMetric, includeMetric, testRunSummary.lastUpdated));
                }

            })
          })

          _.each(metricsToIncludeInTestRunSummary, function(includeMetric){

              var index = updatedTestRunSummary.metrics.map(function(metric){return metric._id.toString();}).indexOf(includeMetric._id.toString());
              if (index === -1) {
                updatedTestRunSummary.metrics.push(includeMetric);
                /* set dygraphData to undefined! */
                updatedTestRunSummary.metrics[updatedTestRunSummary.metrics.length-1].dygraphData = undefined;
                /* set annotations*/
                updatedTestRunSummary.metrics[updatedTestRunSummary.metrics.length-1].summaryText = includeMetric.defaultSummaryText;

              }

          })



        resolve(updatedTestRunSummary);

    });

  });

}

function updateTestRunSummaryMetric(testRunSummaryMetric, includeMetric, testRunSummaryLastUpdated){

  /* if last update of testrun summary is newer than metric last update, do nothing */
  if(!includeMetric.lastUpdated || (includeMetric.lastUpdated && new Date(testRunSummaryLastUpdated).getTime() > new Date(includeMetric.lastUpdated).getTime())){

    return testRunSummaryMetric;

  }else{

    /* if targets are different */

    if(!_.isEqual(testRunSummaryMetric.targets, includeMetric.targets )){

      /* set dygraphData to undefined! */
      testRunSummaryMetric.dygraphData = undefined;
      testRunSummaryMetric.targets = includeMetric.targets;



    }

    testRunSummaryMetric.summaryText = includeMetric.defaultSummaryText;
    testRunSummaryMetric.unit = includeMetric.unit;

    return testRunSummaryMetric;

  }


}

function updateRequirements(testRunSummary){

  return new Promise((resolve, reject) => {

    var testRunSummaryRequirements = [];
      /* set requirements */

    dashboard.getDashboard (testRunSummary.productName, testRunSummary.dashboardName)
        .then(function(dashboard){

          var dashboardMetricsWithRequirements = dashboard.metrics.filter(function(metric){
        if (metric.requirementValue && metric.requirementOperator) return metric;
      });

      Testrun.findOne({
        $and: [
          {productName: testRunSummary.productName},
          {dashboardName: testRunSummary.dashboardName},
          {testRunId: testRunSummary.testRunId}
        ]
      }).exec(function (err, testRun) {


          _.each(dashboardMetricsWithRequirements, function(dashboardMetric){

            var index = testRun.metrics.map(function(testRunMetric){return testRunMetric._id.toString()}).indexOf(dashboardMetric._id.toString());

            if(index !== -1) {

              var requirementText = testRun.metrics[index].requirementOperator == "<" ? testRun.metrics[index].alias + ' should be lower than ' + testRun.metrics[index].requirementValue : testRun.metrics[index].alias + ' should be higher than ' + testRun.metrics[index].requirementValue;

              var tag = testRun.metrics[index].tags.length > 0 ? testRun.metrics[index].tags[0].text : 'All';

              testRunSummaryRequirements.push({
                metricAlias: testRun.metrics[index].alias,
                tag: tag,
                requirementText: requirementText,
                meetsRequirement: testRun.metrics[index].meetsRequirement
              });

            }
          });

          testRunSummary.requirements = testRunSummaryRequirements;

          resolve(testRunSummary);
        });

      });
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


          Jenkins.getJenkinsData(savedTestRunSummary.buildResultsUrl, false, savedTestRunSummary.start, savedTestRunSummary.end, savedTestRunSummary.productName, savedTestRunSummary.dashboardName, function (response) {

            if(response.status === 'fail') {

              winston.error('Persisting of Gatling data failed due to: ' + response.data);

            }
          });
        }

      });

    }
  });
}

function updateTestrunSummary(req, res){


    TestrunSummary.findOne({_id: req.body._id}).exec(function(err, testRunSummary){

      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else{

        if(testRunSummary){


          if(req.body.testRunId) testRunSummary.testRunId = req.body.testRunId;
          if(req.body.annotations) testRunSummary.annotations = req.body.annotations;
          if(req.body.metrics) testRunSummary.metrics = req.body.metrics;
          if(req.body.markDown) testRunSummary.markDown = req.body.markDown;
          if(req.body.requirements) testRunSummary.requirements = req.body.requirements;
          if(req.body.productRelease) testRunSummary.productRelease = req.body.productRelease;
          testRunSummary.lastUpdated = new Date().getTime();

          testRunSummary.save(function(err, savedTestRunSummary){

            if (err) {
              return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
            } else {

              res.jsonp(savedTestRunSummary);

            }
          });
         }else{

          return res.status(404).send({ message: "Test run summary not found!"});
        }

      }

    })

}

function deleteTestrunSummary (req, res){

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

       testRunSummary.remove(function(err, removedTestRunSummary ){

         res.jsonp(removedTestRunSummary);

       })

    }
  })

}
