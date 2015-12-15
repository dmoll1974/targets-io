'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var _ = require('lodash');
var RunningTest = mongoose.model('RunningTest');
var Event = mongoose.model('Event');


exports.keepAlive = keepAlive;
exports.updateRunningTest = updateRunningTest;
exports.synchronizeEvents = synchronizeEvents;
exports.getRunningTests = getRunningTests;
exports.runningTestForDashboard = runningTestForDashboard;



/* start polling */
setInterval(synchronizeEvents, 60 * 1000);

function runningTestForDashboard(req, res){

  RunningTest.findOne({$and:[{productName: req.params.productName}, {dashboardName: req.params.dashboardName}]}).exec(function(err, runningTest){
    if(err){
      console.log(err);
    }else{

        res.jsonp(runningTest);

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


  RunningTest.findOne({$and:[{productName: productName}, {dashboardName: dashboardName}, {testRunId: testRunId}]}).exec(function(err, runningTest){

    /* if entry exists just update the keep alive timestamp */
    if(runningTest){

      runningTest.keepAliveTimestamp = new Date().getTime();
      runningTest.save(function(err, runnigTestSaved){

      });

    /* if entry does not exist, create new one */
    }else{

      newRunningTest = new RunningTest({
        testRunId: testRunId,
        productName: productName,
        dashboardName: dashboardName
      });

      newRunningTest.save(function(err, newRunningTest){

      });
    }
  });
}

/* create end event when running test is removed */
function synchronizeEvents () {

  /* Get all runnign tests */

  RunningTest.find().exec(function (err, runningTests) {

    /* Get all start events from the last 50 hours*/
    var runningTestInterval = new Date() - 1000 * 60 * 60 * 50;

    Event.find({$and: [{eventDescription: 'start'}, {eventTimestamp: {$gte: runningTestInterval}}]}).exec(function (err, startEvents) {

      if (err) {
        console.log(err);
      } else {

        _.each(startEvents, function (startEvent) {

          var running = false;

          _.each(runningTests, function (runningTest) {

            if (startEvent.productName === runningTest.productName && startEvent.dashboardName === runningTest.dashboardName && startEvent.testRunId === runningTest.testRunId) running = true;

          });

          if (running === false) {

            var endEvent = new Event({
              productName: startEvent.productName,
              dashboardName: startEvent.dashboardName,
              testRunId: startEvent.testRunId,
              eventDescription: 'end',
              buildResultKey: startEvent.buildResultKey
            });

            Event.find({$and: [{productName: startEvent.productName}, {dashboardName: startEvent.dashboardName},{testRunId: startEvent.testRunId}, {eventDescription: 'end'}]}).exec(function(err, endEvents){

              if (err) {
                console.log(err);
              }else {

                if (endEvents.length === 0) {

                  endEvent.save(function (err, endEvent) {

                    console.log('Created end event for product:' + endEvent.productName + ' dashboard: ' + endEvent.dashboardName + ' testRunId: ' + endEvent.testRunId);

                  });

                }
              }

            });

          }


        });
      }
    });
  });
}
