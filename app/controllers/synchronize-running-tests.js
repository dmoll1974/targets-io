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



/**
 * Running test Schema
 */
var RunningTestSchema = new mongoose.Schema({
  'testRunId': String,
  'start': {
    type: Date,
    default: Date.now
  },
  'end': {
    type: Date
  },
  'keepAliveTimestamp': {
    type: Date,
    default: Date.now
  },
  'completed': {
    type: Boolean,
    default: false
  },
  'productName': String,
  'productRelease': {
    type: String,
    uppercase: true
  },
  'dashboardName': {
    type: String,
    uppercase: true
  },
  'buildResultsUrl': String,
  'humanReadableDuration': String,
  'rampUpPeriod': Number

},
    {
      read: 'primary'
    });

RunningTestSchema.index({
  testRunId: 1,
  productName: 1,
  dashboardName: 1

}, { unique: true });


mongoose.model('RunningTest', RunningTestSchema);

var testRunTargetSchema = new Schema({
  'meetsRequirement': Boolean,
  'benchmarkResultFixedOK': Boolean,
  'benchmarkResultPreviousOK': Boolean,
  'target': String,
  'value': Number,
  'benchmarkPreviousValue': Number,
  'benchmarkFixedValue': Number
},
    {
      read: 'primary'
    });
mongoose.model('TestrunTarget', testRunTargetSchema);
var testRunMetricSchema = new Schema({
  'alias': String,
  'type': String,
  'tags': [{ text: String }],
  'requirementOperator': String,
  'requirementValue': String,
  'benchmarkOperator': String,
  'benchmarkValue': String,
  'meetsRequirement': {
    type: Boolean,
    default: null
  },
  'benchmarkResultFixedOK': {
    type: Boolean,
    default: null
  },
  'benchmarkResultPreviousOK': {
    type: Boolean,
    default: null
  },
  'annotation': String,
  'targets': [testRunTargetSchema]
},
    {
      read: 'primary'
    });
mongoose.model('TestrunMetric', testRunMetricSchema);
/**
 * Testrun Schema
 */
var TestrunSchema = new Schema({
  'productName': {
    type: String,
    uppercase: true
  },
  'productRelease': {
    type: String,
    uppercase: true
  },
  'dashboardName': {
    type: String,
    uppercase: true
  },
  'testRunId': {
    type: String,
    uppercase: true
  },
  'start': {
    type: Date,
    expires: config.graphiteRetentionPeriod
  },
  'end': Date,
  'baseline' : {
    type: String,
    default: null
  },
  'previousBuild': {
    type: String,
    default: null
  },
  'completed': {
    type: Boolean,
    default: true
  },
  'humanReadableDuration': String,
  'meetsRequirement': Boolean,
  'benchmarkResultFixedOK': Boolean,
  'benchmarkResultPreviousOK': Boolean,
  'buildResultsUrl': String,
  'annotations': String,
  'rampUpPeriod': {
    type: Number
  },
  'metrics': [testRunMetricSchema]
},
    {
      toObject: { getters: true },
      read: 'primary'
    } );
TestrunSchema.virtual('startEpoch').get(function () {
  return this.start.getTime();
});
TestrunSchema.virtual('endEpoch').get(function () {
  return this.end.getTime();
});
TestrunSchema.index({
  testRunId: 1,
  dashboardId: 1
}, { unique: true });
mongoose.model('Testrun', TestrunSchema);


//Better logging
winston.remove(winston.transports.Console);
if (process.env.isDevelopment) {
  console.log('isDevelopment: ' + process.env.isDevelopment );
  // only log to console in development environment
  winston.add(winston.transports.Console, {
    timestamp: true,
    colorize: !process.env.isProduction,
    level: process.env.logLevel
  });
}

if (process.env.graylogHost) {


  console.log ("graylog host: " + process.env.graylogHost + ':' + process.env.graylogPort );

  winston.add(require('winston-graylog2'), {
    name: 'Graylog',
    graylog: {
      servers: [{host: process.env.graylogHost, port: process.env.graylogPort}],
      facility: 'targets-io-sync-running-tests'
    },
    level: process.env.logLevel
    /*,
     staticMeta: {environment: config.environment, source: os.hostname()}*/
  });
}



var db = connect();

function connect() {

  if(!process.env.isDemo) {

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var options = {
      //user: process.env.dbUsername,
      //pass: process.env.dbPassword,
      server: {
        //poolSize: 20,
        auto_reconnect: true, // already default, but explicit
        reconnectTries: 30, // already default, explicit
        socketOptions: {
          keepAlive: 100000, // less then 120s configured on mongo side
          connectTimeoutMS: 10000
        }
      }
    };
  }else {

      if (process.env.dbUsername && process.env.dbPassword) {


        winston.info("Connect (with credentials) synchronize-running-tests to: " + process.env.db);
        var mongoUrl = 'mongodb://' + process.env.dbUsername + ':' + process.env.dbPassword + '@' + process.env.db;

      } else {

        winston.info("Connect synchronize-running-tests to: " + process.env.db);
        var mongoUrl = 'mongodb://' + process.env.db;
      }
  }


  mongoose.connection.once('open', function() {
    winston.info('Connected to MongoDB server with mongoose.');
  });

  mongoose.connection.on('error', function (err) { winston.error("Synchronize-running-tests connect error: " + err) });

  mongoose.connection.on('disconnected', () => {
    // http://mongoosejs.com/docs/connections.html
    winston.error('Disconnected MongoDB with mongoose, will autoreconnect a number of times');
  });

  // If the Node process ends, gracefully close the Mongoose connection
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, function cleanup() {
      mongoose.connection.close(() => {
        winston.error('Mongoose default connection disconnected through app termination');
        process.exit(0);
      });
    });
  });


  return mongoose.connect(mongoUrl, options);

};



var RunningTest = mongoose.model('RunningTest');
var Testrun = mongoose.model('Testrun');



/* start polling every minute */
  setInterval(synchronizeRunningTestRuns, 60 * 1000);




function synchronizeRunningTestRuns () {


  var dateNow = new Date().getTime();


  /* Get  running tests */

  RunningTest.find().exec(function (err, runningTests) {
    if(err){

      winston.error(err)
    }else {

      winston.info('checking running tests');

      _.each(runningTests, function (runningTest) {

        /* if keep alive is older than 16 seconds, save running test in test run collection and remove from running tests collection */
        if (dateNow - new Date(runningTest.keepAliveTimestamp).getTime() > 16 * 1000) {

          /* mark test as not completed */
          runningTest.completed = false;

          saveTestRun(runningTest)
          .then(function(savedTestRun){

            winston.info('removed running test: ' + savedTestRun.testRunId);

          })
          .catch(runningTestErrorHandler);


        }

      });
    }
  });
}

let runningTestErrorHandler = function(err){

  winston.error('Error in saving test run: ' + err.stack);
}


let saveTestRun = function (runningTest){

  return new Promise((resolve, reject) => {

    let testRun = new Testrun({

      productName: runningTest.productName,
      productRelease: runningTest.productRelease,
      dashboardName: runningTest.dashboardName,
      testRunId: runningTest.testRunId,
      start: runningTest.start,
      end: runningTest.end,
      rampUpPeriod: runningTest.rampUpPeriod,
      completed: runningTest.completed,
      humanReadableDuration: humanReadbleDuration(runningTest.end.getTime() - runningTest.start.getTime()),
      buildResultsUrl: runningTest.buildResultsUrl,
      meetsRequirement: null,
      benchmarkResultFixedOK: null,
      benchmarkResultPreviousOK: null

    });


      testRun.save(function (err, savedTestRun) {
        if (err) {

          winston.error(err);
          /* In case of error still remove running test! */
          runningTest.remove(function (err) {

            if (err) {

              winston.error(err);
            }else {

              process.send({
                room: room,
                type: 'runningTest',
                event: 'removed',
                testrun: runningTest
              });

              process.send({
                room: 'running-test',
                type: 'runningTest',
                event: 'removed',
                testrun: runningTest
              });

              //resolve(savedTestRun);
              reject(err);

            }
          });

        } else {

          var room = runningTest.productName + '-' + runningTest.dashboardName;

          process.send({
            room: room,
            type: 'testrun',
            event: 'saved',
            testrun: runningTest
          });


          process.send({
            room: 'recent-test',
            type: 'testrun',
            event: 'saved',
            testrun: runningTest
          });

          runningTest.remove(function (err) {


            process.send({
              room: room,
              type: 'runningTest',
              event: 'removed',
              testrun: runningTest
            });

            process.send({
              room: 'running-test',
              type: 'runningTest',
              event: 'removed',
              testrun: runningTest
            });

            resolve(savedTestRun);
          });
        }

    });
  });
}

function humanReadbleDuration(durationInMs){

  var date = new Date(durationInMs);
  var readableDate = '';
  var daysLabel = (date.getUTCDate()-1 === 1) ? " day, " : " days, ";
  var hoursLabel = (date.getUTCHours() === 1) ? " hour, " : " hours, "
  var minutesLabel = (date.getUTCMinutes() === 1) ? " minute" : " minutes";
  var secondsLabel = (date.getUTCSeconds() === 1) ? "  second" : "  seconds";

  if(date.getUTCDate()-1 > 0) readableDate += date.getUTCDate()-1 + daysLabel;
  if(date.getUTCHours() > 0) readableDate += date.getUTCHours() + hoursLabel ;
  if(date.getUTCMinutes() > 0)readableDate += date.getUTCMinutes() + minutesLabel ;
  if(date.getUTCMinutes() === 0)readableDate += date.getUTCSeconds() + secondsLabel ;
  return readableDate;
}
