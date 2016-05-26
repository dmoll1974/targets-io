/*jshint maxerr: 10000 */
'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    TestrunSummary = db.model('TestrunSummary'),
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
      res.jsonp(testRunSummary);
    }
  })
}

function createTestrunSummary(req, res){

  var testRunSummary = new TestrunSummary(req.body);


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
