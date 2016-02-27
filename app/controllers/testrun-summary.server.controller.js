/*jshint maxerr: 10000 */
'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    TestrunSummary = db.model('TestrunSummary'),
    _ = require('lodash'),
    Utils = require('./utils.server.controller');




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

  //_.each(testRunSummary.metrics, function(metric){
  //
  //  _.each(metric.dygraphData.data, function(dataline){
  //
  //      dataline[0] = new Date(dataline[0]);
  //  })
  //})

  testRunSummary.save(function(err, savesTestRunSummary){

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(savesTestRunSummary);
    }
  })
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
