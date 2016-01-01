'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var _ = require('lodash');
var RunningTest = mongoose.model('RunningTest');
var Event = mongoose.model('Event');
var Testrun = mongoose.model('Testrun');
var Dashboard = mongoose.model('Dashboard');
var Product = mongoose.model('Product');
var testRuns = require('./testruns.server.controller');


    exports.runningTest = runningTest;
exports.updateRunningTest = updateRunningTest;
exports.synchronizeEvents = synchronizeRunningTestRuns;
exports.getRunningTests = getRunningTests;
exports.runningTestForDashboard = runningTestForDashboard;



/* start polling every minute */
setInterval(synchronizeRunningTestRuns, 60 * 1000);

function runningTestForDashboard(req, res){

  RunningTest.findOne({$and:[{productName: req.params.productName}, {dashboardName: req.params.dashboardName}]}).exec(function(err, runningTest){
    if(err){
      console.log(err);
    }else{

      if(runningTest) {
        res.jsonp(runningTest);
      }else {
        res.jsonp({});
      }

    }


  });

}

function getRunningTests(req, res){

  RunningTest.find().exec(function(err, runningTests){

    if(err){
      console.log(err);
    }else{
      res.jsonp(runningTests);
    }

  });
}

function runningTest(req, res){


  if(req.params.command === 'end'){

    RunningTest.findOne({$and:[
      {productName: req.params.product},
      {dashboardName: req.params.dashboard},
      {testRunId: req.params.testRunId}
    ]}).exec(function(err, runningTest){

      if(runningTest){
        /* mark test run as completed */
        runningTest.completed = true;
        /* set test run end time*/
        runningTest.end = new Date().getTime();
        /* Save test run*/
        saveTestRun(runningTest)
          .then(testRuns.benchmarkAndPersistTestRunById)
          .then(function(testRun){
            res.jsonp(testRun);
          });
      }else{

        return res.status(400).send({ message: 'No running test found for this test run ID!' });

      }
    })
  }else {
    /* first check if test run exists for dashboard */


    Testrun.findOne({
      $and: [
        {productName: req.params.product},
        {dashboardName: req.params.dashboard},
        {testRunId: req.params.testRunId}
      ]
    }).exec(function (err, testRun) {

      if (testRun) {

        return res.status(400).send({message: 'testRunId already exists for dashboard!'});

      } else {

        updateRunningTest(req.params.product, req.params.dashboard, req.params.testRunId)
        .then(function (message) {

          res.jsonp(message);

        });
      }

    });
  }

}

function updateRunningTest(productName, dashboardName, testRunId,  callback) {

  return new Promise((resolve, reject) => {

    let newRunningTest;
    let dateNow = new Date().getTime();


    RunningTest.findOne({$and:[{productName: productName}, {dashboardName: dashboardName}, {testRunId: testRunId}]}).exec(function(err, runningTest){

      /* if entry exists just update the keep alive timestamp */
      if(runningTest){


        runningTest.keepAliveTimestamp = dateNow;
        runningTest.end = dateNow + 60 * 1000;
        runningTest.new = false;
        runningTest.save(function(err, runnigTestSaved){

            resolve('running test updated!');
        });

      /* if entry does not exist, create new one */
      }else{

        newRunningTest = new RunningTest({
          testRunId: testRunId,
          productName: productName,
          dashboardName: dashboardName,
          keepAliveTimestamp: dateNow,
          end: dateNow + 60 * 1000
        });

        newRunningTest.save(function(err, newRunningTest){

          resolve('running test created!');
        });
      }
    });
  });
}

function synchronizeRunningTestRuns () {


  var dateNow = new Date().getTime();


  /* Get  running tests */

  RunningTest.find().exec(function (err, runningTests) {

    console.log('checking running tests');

    _.each(runningTests, function (runningTest) {

            /* if keep alive is older than 1 minute, save running test in test run collection and remove from running tests collection */
            if (dateNow - runningTest.keepAliveTimestamp.getTime() > 61 * 1000){

              /* mark test as not completed */
              runningTest.completed = false;

              saveTestRun(runningTest)
              .then(function(message){
                console.log(message);
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
      completed: runningTest.completed

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

let errorHandler = function (err){

  console.log('Error: ' + err);

}
