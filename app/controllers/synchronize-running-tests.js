'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var chalk = require('chalk');
var config = require('../../config/config');
var winston = require('winston');
var RunningTest = mongoose.model('RunningTest');
var Testrun = mongoose.model('Testrun');
var runningTestModule = require('./running-test.server.controller');
var md5 = require('MD5');
var redis = require("redis");
var pub = redis.createClient(config.redisPort, config.redisHost, { returnBuffers: true});
var sub = redis.createClient(config.redisPort, config.redisHost, {returnBuffers: true});
var mutex = require('node-mutex')({pub: pub, sub: sub});

pub.on('error', (err) => {
  console.log('error from pub');
  console.log(err);
});
sub.on('error', (err) => {
  console.log('error from sub');
  console.log(err);
});


exports.synchronizeRunningTestRuns = synchronizeRunningTestRuns;

function createHash(testRunString) {
  var hashedKey;
  hashedKey = md5(testRunString);
  return hashedKey;
}


function synchronizeRunningTestRuns (clusterId) {


  var dateNow = new Date().getTime();


  /* Get  running tests */

  RunningTest.find().exec(function (err, runningTests) {
    if(err){

      winston.error(err)
    }else {

      winston.info('checking running tests, clusterId:' + clusterId);
      console.log('checking running tests, clusterId:' + clusterId);

      _.each(runningTests, function (runningTest) {

        let lockId = createHash(runningTest.productName + runningTest.dashboardName + runningTest.testRunId );

        mutex.lock( lockId, function( err, unlock ) {


            /* if keep alive is older than 16 seconds, save running test in test run collection and remove from running tests collection */
            if (dateNow - new Date(runningTest.keepAliveTimestamp).getTime() > 16 * 1000) {

              /* mark test as not completed */
              runningTest.completed = false;

              runningTestModule.saveTestRun(runningTest)
              .then(function(savedTestRun){

                unlock();
                winston.info('removed running test: ' + savedTestRun.testRunId);

              })
              .catch(function(err){
                unlock();
                runningTestErrorHandler(err)
              });


            }else{

              unlock();
            }

        });
      });
    }
  });
}

let runningTestErrorHandler = function(err){
    winston.error('Error in saving test run: ' + err);
}


