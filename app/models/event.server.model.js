'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../../config/config');

/**
 * Event Schema
 */
var eventSchema = new mongoose.Schema({
  'productName': {
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
  'eventDescription': String,
  'eventTimestamp': {
    type: Date,
    default: Date.now,
    expires: config.graphiteRetentionPeriod
  },
  'buildResultsUrl': { type: String },
  'hookEnabled': {
    type: Boolean,
    required: false,
    default: true
  }
});
eventSchema.index({
  productName: 1,
  dashboardName: 1,
  testRunId: 1,
  eventDescription: 1
}, { unique: true });

eventSchema.on('index', function (err) {
  if (err) {
    console.error('User index error: %s', err);
  } else {
    console.info('User indexing complete');
  }
});
/* create test run if end event is saved */
eventSchema.post('save', function(event) {

  if(event.hookEnabled) {
    var testruns = require('../controllers/testruns.server.controller.js'),
        Dashboard = mongoose.model('Dashboard'),
        Product = mongoose.model('Product'),
        Testrun = mongoose.model('Testrun');

    /* if "end" event, check if corresponding "start" event exist and add to test runs */
    Product.findOne({name: event.productName}).exec(function (err, product) {
      Dashboard.findOne({
        $and: [
          {productId: product._id},
          {name: event.dashboardName}
        ]
      }).exec(function (err, dashboard) {
        if (event.eventDescription === 'end' && dashboard.useInBenchmark === true) {
          mongoose.model('Event', eventSchema).findOne({
            $and: [
              {testRunId: event.testRunId},
              {eventDescription: 'start'}
            ]
          }).exec(function (err, startEvent) {
            if (err) {
              return res.status(400).send({message: errorHandler.getErrorMessage(err)});
            } else {
              var testRun = new Testrun();
              testRun.start = startEvent.eventTimestamp;
              testRun.end = event.eventTimestamp;
              testRun.productName = event.productName;
              testRun.dashboardName = event.dashboardName;
              testRun.testRunId = event.testRunId;
              testRun.baseline = dashboard.baseline;
              testRun.buildResultsUrl = event.buildResultsUrl;
              testRun.eventIds.push(startEvent._id, event._id);

              testruns.benchmarkAndPersistTestRunById(testRun.productName, testRun.dashboardName, testRun, function (storedTestrun) {
                console.log('test run stored');
              });
            }
          });
        }
      });
    })
  }
});
mongoose.model('Event', eventSchema);
