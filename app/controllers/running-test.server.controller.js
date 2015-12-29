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


exports.keepAlive = keepAlive;
exports.updateRunningTest = updateRunningTest;
exports.synchronizeEvents = synchronizeRunningTestRuns;
exports.getRunningTests = getRunningTests;
exports.runningTestForDashboard = runningTestForDashboard;




/* start polling */
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

function keepAlive(req, res){

  updateRunningTest(req.params.product, req.params.dashboard, req.params.testRunId, function(message){

      res.jsonp(message);

  });
}

function updateRunningTest(productName, dashboardName, testRunId, callback) {

  var newRunningTest;
  var dateNow = new Date().getTime();

  RunningTest.findOne({$and:[{productName: productName}, {dashboardName: dashboardName}, {testRunId: testRunId}]}).exec(function(err, runningTest){

    /* if entry exists just update the keep alive timestamp */
    if(runningTest){

      runningTest.keepAliveTimestamp = dateNow;
      runningTest.end = dateNow + 60 * 1000;

      runningTest.save(function(err, runnigTestSaved){

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

      });
    }
  });
}

/* create end event when running test is removed */
function synchronizeRunningTestRuns () {


  var dateNow = new Date().getTime();


  /* Get all running tests */

  RunningTest.find().exec(function (err, runningTests) {

          _.each(runningTests, function (runningTest) {

            /* if keep alive is older than 1 minute, save running test in test run collection and remove from running tests collection */
            if (dateNow - runningTest.keepAliveTimeStamp > 61 * 1000){

              runningTest.remove(function(err){

                var testRun = new Testrun({

                  productName: runningTest.productName ,
                  dashboardName: runningTest.dashboardName,
                  testRunId: runningTest.testRunId,
                  start: runningTest.start ,
                  end: runningTest.end

                });

                /* Add baseline and previous build */
                getBaseline(testRun, function(updatedTestrun){

                  updatedTestrun.save(function(err, savedTestRun){

                    if(err){
                      console.log(err);
                    }else{
                      console.log(savedTestRun);
                    }
                  })


                });



              });
            }

          });

  });
}

function getBaseline(testRun) {

  return new Promise((resolve, reject) => {

    Product.findOne({name: testRun.productName}).exec(function (err, product) {
      if (err) {
        reject(err);
      }else {
        Dashboard.findOne({
          $and: [
            {productId: product._id},
            {name: testRun.dashboardName}
          ]
        }).exec(function (err, dashboard) {

          if (err) {
            reject(err);
          } else {
            /* if baseline has been set for dashboard, return baeline */
            if (dashboard.baseline) {

              resolve(dashboard.baseline);
              /* else set current testRunId as baseline and return null */
            } else {

              dashboard.baseline = testRunId;
              dashboard.save(function (err, updatedDashboard) {

                if (err) {
                  reject(err);
                } else {
                  resolve(null);
                }
              });

            }
          }
        })
      }
    })

  })
}
function getPreviousBuild(testRun) {

  return new Promise((resolve, reject) => {



    Testruns.find({
      $and: [
        {productName: testRun.productName},
        {dashboardName: testRun.dashboardName}
      ]
    }).sort({end: -1}).exec(function (err, savedTestRuns) {
      if (err) {
        reject(err);
      } else {

        let previousBuild;

        _.each(savedTestRuns, function (savedTestrun, i) {
          if (savedTestrun.testRunId === testRun.testRunId) {
            if (i + 1 === savedTestRuns.length) {
              return null;
            } else {
              previousBuild = savedTestRuns[i + 1].testRunId;
              return previousBuild;
            }
          }
        });
        resolve(previousBuild);

      }
    });
  })
}
