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
var testRunsModule = require('./testruns.server.controller');


exports.runningTest = runningTest;
exports.updateRunningTest = updateRunningTest;
exports.getRunningTests = getRunningTests;
exports.runningTestForDashboard = runningTestForDashboard;

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

  let runningTestKeepAlive = req.body;
  let productName = runningTestKeepAlive.productName;
  let dashboardName = runningTestKeepAlive.dashboardName;
  let testRunId = runningTestKeepAlive.testRunId.toUpperCase();

  if(req.params.command === 'end'){

    RunningTest.findOne({$and:[
      {productName: productName},
      {dashboardName: dashboardName},
      {testRunId: testRunId}
    ]}).exec(function(err, runningTest){

      if(runningTest){
        /* mark test run as completed */
        runningTest.completed = true;
        /* set test run end time*/
        runningTest.end = new Date().getTime();
        /* Save test run*/

        saveTestRun(runningTest)
          .then(testRunsModule.benchmarkAndPersistTestRunById)
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
        {productName: productName},
        {dashboardName: dashboardName},
        {testRunId: testRunId}
      ]
    }).exec(function (err, testRun) {

      /* if completed test run is found return error */
      if (testRun && testRun.completed === true) {

        return res.status(400).send({message: 'testRunId already exists for dashboard!'});

      } else {

        /* if incomplete test run is found, assume the test run was ended due to hiccup in keepalive calls.  */

        if(testRun && testRun.completed === false) {

          /* add original start time */
          runningTestKeepAlive.start = testRun.start;

          /* remove test run from collection */
          Testrun.remove({
            $and: [
              {productName: productName},
              {dashboardName: dashboardName},
              {testRunId: testRunId}
            ]
          }).exec(function (err, testRunDeleted) {

            var io = global.io;
            var room = testRun.productName + '-' + testRun.dashboardName;


            console.log('emitting message to room: ' + room);
            io.sockets.in(room).emit('testrun', {event: 'removed', testrun: testRun});
            console.log('emitting message to room: running-test');
            io.sockets.in('recent-test').emit('testrun', {event: 'removed', testrun: testRun});

            updateRunningTest(runningTestKeepAlive)
                .then(function (message) {

                  res.jsonp(message);

                });
          });

        }else {

          updateRunningTest(runningTestKeepAlive)
              .then(function (message) {

                res.jsonp(message);

              });
        }
      }



    });
  }

}

function updateRunningTest(runningTest) {

  return new Promise((resolve, reject) => {

    let newRunningTest;
    let dateNow = new Date().getTime();


    RunningTest.findOne({$and:[{productName: runningTest.productName}, {dashboardName: runningTest.dashboardName}, {testRunId: runningTest.testRunId.toUpperCase()}]}).exec(function(err, storedRunningTest){

      /* if entry exists just update the keep alive timestamp */
      if(storedRunningTest){

        storedRunningTest.keepAliveTimestamp = dateNow;
        storedRunningTest.end = dateNow + 30 * 1000;
        storedRunningTest.humanReadableDuration = testRunsModule.humanReadbleDuration(new Date().getTime() - storedRunningTest.start.getTime());
        storedRunningTest.rampUpPeriod = runningTest.rampUpPeriod;

        storedRunningTest.save(function(err, runnigTestSaved){

          var io = global.io;
          var room = runningTest.productName + '-' + runningTest.dashboardName;

          console.log('emitting message to room: ' + room);
          io.sockets.in(room).emit('runningTest', {event: 'saved', testrun: storedRunningTest});
          console.log('emitting message to room: running-test');
          io.sockets.in('running-test').emit('runningTest', {event: 'saved', testrun: storedRunningTest});

          resolve('running test updated!');
        });

        /* if entry does not exist, create new one */

      }else{

        /* get duration for last completed test run */

        Testrun.findOne({
          $and: [
            {productName: runningTest.productName},
            {dashboardName: runningTest.dashboardName},
            {completed: true}
          ]
        }).sort({end: -1}).exec(function (err, testRun) {


          var lastKnownDuration = testRun ? new Date(testRun.end).getTime() - new Date(testRun.start).getTime() : undefined;

          newRunningTest = new RunningTest(runningTest);

          /* set timestamps */
          /* if start request, give some additional time to start up */

          newRunningTest.keepAliveTimestamp = dateNow + 30 * 1000;
          newRunningTest.lastKnownDuration = lastKnownDuration;
          newRunningTest.end = dateNow + 30 * 1000;
          newRunningTest.humanReadableDuration = testRunsModule.humanReadbleDuration(new Date().getTime() - newRunningTest.start.getTime())
          newRunningTest.save(function(err, newRunningTest){

            var io = global.io;
            var room = runningTest.productName + '-' + runningTest.dashboardName;

            console.log('emitting message to room: ' + room);
            io.sockets.in(room).emit('runningTest', {event: 'saved', testrun: newRunningTest});
            console.log('emitting message to room: running-test ');
            io.sockets.in('running-test').emit('runningTest', {event: 'saved', testrun: newRunningTest});

            resolve('running test created!');
          });

        });

      }
    });
  });
}



let saveTestRun = function (runningTest){

  return new Promise((resolve, reject) => {

    let testRun = new Testrun(runningTest);

    testRun.save(function (err, savedTestRun) {

      if (err) {

        /* In case of error still remove running test! */
        runningTest.remove(function (err) {

          var io = global.io;
          var room = runningTest.productName + '-' + runningTest.dashboardName;


          console.log('emitting message to room: ' + room);
          io.sockets.in(room).emit('runningTest', {event: 'removed', testrun: runningTest});
          console.log('emitting message to room: running-test');
          io.sockets.in('running-test').emit('runningTest', {event: 'removed', testrun: runningTest});

          /* no matter if remove fails, still resolve*/
          resolve(savedTestRun);

        });

      } else {

        var io = global.io;
        var room = runningTest.productName + '-' + runningTest.dashboardName;

        console.log('emitting message to room: ' + room);
        io.sockets.in(room).emit('testrun', {event: 'saved', testrun: savedTestRun});
        io.sockets.in('recent-test').emit('testrun', {event: 'saved', testrun: savedTestRun});

        runningTest.remove(function (err) {


          console.log('emitting message to room: ' + room);
          io.sockets.in(room).emit('runningTest', {event: 'removed', testrun: runningTest});
          console.log('emitting message to room: running-test');
          io.sockets.in('running-test').emit('runningTest', {event: 'removed', testrun: runningTest});

          /* no matter if remove fails, still resolve*/
            resolve(savedTestRun);

        });
      }
    });

  });
}

