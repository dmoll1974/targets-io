/*jshint maxerr: 10000 */
'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Event = mongoose.model('Event'),
    Testrun = mongoose.model('Testrun'),
    Dashboard = mongoose.model('Dashboard'),
    Product = mongoose.model('Product'),
    _ = require('lodash'),
    graphite = require('./graphite.server.controller'),
    Utils = require('./utils.server.controller'),
    Requirements = require('./testruns.requirements.server.controller'),
    Benchmarks = require('./testruns.benchmarks.server.controller'),
    Metric = mongoose.model('Metric'),
    async = require('async'),
    RunningTest = mongoose.model('RunningTest'),
    ss = require('simple-statistics');




exports.productReleasesFromTestRuns = productReleasesFromTestRuns;
exports.benchmarkAndPersistTestRunById = benchmarkAndPersistTestRunById;
exports.testRunsForDashboard = testRunsForDashboard;
exports.testRunsForProduct = testRunsForProduct;
exports.testRunsForProductRelease = testRunsForProductRelease;
exports.deleteTestRunById = deleteTestRunById;
exports.testRunById = testRunById;
exports.refreshTestrun = refreshTestrun;
exports.updateTestrunsResults = updateTestrunsResults;
//exports.saveTestRunAfterBenchmark = saveTestRunAfterBenchmark;
exports.updateAllDashboardTestRuns = updateAllDashboardTestRuns;
exports.updateAllProductTestRuns = updateAllProductTestRuns;
exports.recentTestRuns = recentTestRuns;
exports.update = update;
exports.addTestRun = addTestRun;
exports.humanReadbleDuration = humanReadbleDuration;

function addTestRun(req, res){

  let testRun = new Testrun(req.body);

  testRun.humanReadableDuration = humanReadbleDuration(testRun.end.getTime() - testRun.start.getTime());
  testRun.meetsRequirement = null;

  testRun.save(function(err, testRun){

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {

      //benchmarkAndPersistTestRunById(testRun)
      //.then(function(testRun){
        res.jsonp(testRun);
      //});
    }

  });
}

/**
 * Update a Dashboard
 */
function update (req, res) {

  Testrun.findOne({_id: req.body._id}).exec(function(err, testRun){

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else{

      testRun.start = req.body.start;
      testRun.end = req.body.end;
      testRun.productName = req.body.productName;
      testRun.productRelease = req.body.productRelease;
      testRun.dashboardName = req.body.dashboardName;
      testRun.testRunId = req.body.testRunId;
      testRun.completed = req.body.completed;
      testRun.buildResultsUrl = req.body.buildResultsUrl;
      testRun.rampUpPeriod = req.body.rampUpPeriod;
      testRun.annotations = req.body.annotations;
      testRun.humanReadableDuration = humanReadbleDuration(new Date(req.body.end).getTime() - new Date(req.body.start).getTime());

      testRun.save(function(err, savedTestRun){

        if (err) {
          return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else {

          res.jsonp(savedTestRun);

        }
      });
    }

  })


};


function recentTestRuns(req, res){

  /* Get all test runs from the last 24 hours*/
  var pastDay = new Date() - 1000 * 60 * 60 * 24;

  Testrun.find({end: {$gte: pastDay}}).exec(function (err, testRuns) {

    _.each(testRuns, function(testRun, i){

      testRuns[i].humanReadableDuration = humanReadbleDuration(testRun.end.getTime() - testRun.start.getTime());

    });

      res.jsonp(testRuns);


  });
}



function updateTestrunsResults(req, res) {
  Testrun.find({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName }
    ]
  }).exec(function (err, testRuns) {
    if (err) {
      console.log(err);
    } else {
      async.forEachLimit(testRuns, 1, function (testRun, callback) {
          updateMetricInTestrun(req.params.metricId, testRun)
          .then(function(testRun){
            if (req.params.updateRequirements === 'true'){
              Requirements.updateRequirementResults(testRun)
              .then(function (requirementsTestRun){
                if(req.params.updateBenchmarks === 'true'){
                  Benchmarks.updateBenchmarkResults(requirementsTestRun)
                  .then(function(){
                    callback();
                  });
                }else{

                  callback();
                }

              });
            }else{

              if(req.params.updateBenchmarks === 'true'){
                Benchmarks.updateBenchmarkResults(testRun)
                .then(function(){
                  callback();
                });
              }
            }
          });


      }, function (err) {
        if (err)
          console.log(err);
        /* return updated test runs */

        Testrun.find({
          $and: [
            { productName: req.params.productName },
            { dashboardName: req.params.dashboardName }
          ]
        }).exec(function (err, testRuns) {
          if (err) {
            console.log(err);
          } else {
            res.json(testRuns);
          }
        });
      });
    }
  });
}
function  updateMetricInTestrun(metricId, testRun) {

  return new Promise((resolve, reject) => {

      var updatedMetrics = [];
      Metric.findOne({ _id: metricId }).exec(function (err, dashboardMetric) {
        if (err)
          console.log(err);
        _.each(testRun.metrics, function (testrunMetric) {
          if (testrunMetric.alias === dashboardMetric.alias) {
            testrunMetric.requirementOperator = dashboardMetric.requirementOperator;
            testrunMetric.requirementValue = dashboardMetric.requirementValue;
            testrunMetric.benchmarkOperator = dashboardMetric.benchmarkOperator;
            testrunMetric.benchmarkValue = dashboardMetric.benchmarkValue;
          }
          updatedMetrics.push(testrunMetric);
        });
        /* Save updated test run */

        Testrun.findOneAndUpdate({
              $and: [
                {productName: testRun.productName},
                {dashboardName: testRun.dashboardName},
                {testRunId: testRun.testRunId}
              ]
            }, {metrics: updatedMetrics}
            , {upsert: true}, function (err, savedTestRun) {
              if (err) {
                reject(err);
              } else {
                resolve(savedTestRun);
              }

            });


      });
  });
}
function deleteTestRunById(req, res) {
  Testrun.findOne({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName },
      { testRunId: req.params.testRunId }
    ]
  }).exec(function (err, testRun) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      if (testRun) {
        testRun.remove(function (err) {
          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          }else{
            res.jsonp({message: 'test run deleted'});
          }
        });
      }
    }
  });
}
/**
 * select test runs for product
 */
function testRunsForProduct(req, res) {
  Testrun.find({productName: req.params.productName, completed: true}).sort({end: -1}).limit(req.params.limit).exec(function (err, testRuns) {
    if (err) {
      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    } else {

      _.each(testRuns, function(testRun, i){

        testRuns[i].humanReadableDuration = humanReadbleDuration(testRun.end.getTime() - testRun.start.getTime());

      });

      res.jsonp(testRuns);

    }
  });
}

/**
 * get distinct releases for product
 */
function productReleasesFromTestRuns(req, res) {
  Testrun.find({productName: req.params.productName}).distinct('productRelease').sort().exec(function (err, releases) {
    if (err) {
      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    } else {


      res.jsonp(releases);

    }
  });
}
/**
 * select test runs for product release
 */
function testRunsForProductRelease(req, res) {
  Testrun.find({$and:[{productName: req.params.productName}, {productRelease: req.params.productRelease}, {completed: true}]}).sort({end: 1}).exec(function (err, testRuns) {
    if (err) {
      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    } else {

      _.each(testRuns, function(testRun, i){

        testRuns[i].humanReadableDuration = humanReadbleDuration(testRun.end.getTime() - testRun.start.getTime());

      });

      res.jsonp(testRuns);

    }
  });
}

  function createTestRunSummaryFromEvents(events, callback) {
    var testRuns = [];
    for (var i = 0; i < events.length; i++) {
      if (events[i].eventDescription === 'start') {
        for (var j = 0; j < events.length; j++) {
          if (events[j].eventDescription === 'end' && events[j].testRunId == events[i].testRunId) {
            testRuns.push({
              start: events[i].eventTimestamp,
              startEpoch: events[i].eventTimestamp.getTime(),
              end: events[j].eventTimestamp,
              endEpoch: events[j].eventTimestamp.getTime(),
              productName: events[i].productName,
              dashboardName: events[i].dashboardName,
              testRunId: events[i].testRunId,
              humanReadbleDuration: humanReadbleDuration(events[j].eventTimestamp.getTime() - events[i].eventTimestamp.getTime()),
              duration: events[j].eventTimestamp.getTime() - events[i].eventTimestamp.getTime()
            });

            break;
          }
        }
      }
    }

    callback(testRuns);
  }

  function humanReadbleDuration(durationInMs){

    var date = new Date(durationInMs);
    var readableDate = '';
    if(date.getUTCDate()-1 > 0) readableDate += date.getUTCDate()-1 + " days, ";
    if(date.getUTCHours() > 0) readableDate += date.getUTCHours() + " hours, ";
    readableDate += date.getUTCMinutes() + " minutes";
    return readableDate;
  }
/**
 * select test runs for dashboard
 */
function testRunsForDashboard(req, res) {

  var response = {};
  response.numberOfRunningTests = 0;
  response.runningTest = false;

  var query = {
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName }
    ]
  };



  Testrun.find(query).sort({end: -1 }).limit(req.params.limit).exec(function(err, testRuns) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {



      //response.totalNumberOftestRuns = testRuns.length;
      //
      ///* Only return paginated test runs */
      //
      //let page = req.params.page;
      //let limit = req.params.limit;
      //let paginatedTestRuns = [];
      //
      //_.each(testRuns, function(testRun, index){
      //
      //  if(index >= (page - 1) * (limit)  && index <= (page * limit) - 1){
      //
      //    paginatedTestRuns.push(testRun);
      //  }
      //
      //});
      //
      //response.testRuns = paginatedTestRuns;

      response.testRuns = testRuns;

    /* Check for running tests */
      RunningTest.find({
        $and: [
          { productName: req.params.productName },
          { dashboardName: req.params.dashboardName }
        ]
      }).exec(function(err, runningTests){

        if(err){
          res.jsonp(response);
        }else{


          /* if running tests are found, put them on top*/
          if(runningTests.length > 0){

            response.runningTest = true;

            _.each(runningTests, function(runningTest){

              response.numberOfRunningTests = response.numberOfRunningTests + 1;


              /* mark temporarily as completed to make it visible in test run list*/
              runningTest.completed = true;

              response.testRuns.unshift(runningTest);

            })


          }


          res.jsonp(response);
        }

      });


    }
  });

  function persistTestrunsFromEvents(testRuns, testRunsFromEvents, callback) {
    var persistedTestRuns = [];
    var testRunsToBePersisted = [];
    var testRunsToBenchmark = [];
    _.each(testRunsFromEvents, function (testRunFromEvents) {
      var exists = false;
      _.each(testRuns, function (testRun) {
        if (testRun.testRunId === testRunFromEvents.testRunId) {
          exists = true;
          persistedTestRuns.push(testRun);
          return exists;
        }
      });
      if (exists === false) {
        testRunsToBePersisted.push(testRunFromEvents);
      }
    });
    async.forEachLimit(testRunsToBePersisted, 16, function (testRun, callback) {
      getDataForTestrun(testRun.productName, testRun.dashboardName, testRun, function (metrics) {
        saveTestrun(testRun, metrics, function (savedTestrun) {
          console.log('test run saved: ' + savedTestrun.testRunId);
          testRunsToBenchmark.push(savedTestrun);
          callback();
        });
      });
    }, function (err) {
      if (err)
        return next(err);
      testRunsToBenchmark.sort(Utils.dynamicSort('-start'));
      async.forEachLimit(testRunsToBenchmark, 1, function (testRun, callback) {
        Requirements.setRequirementResultsForTestRun(testRun, function (requirementsTestrun) {
          if (requirementsTestrun)
            console.log('Requirements set for: ' + requirementsTestrun.productName + '-' + requirementsTestrun.dashboardName + 'testrunId: ' + requirementsTestrun.testRunId);
          Benchmarks.setBenchmarkResultsPreviousBuildForTestRun(requirementsTestrun, function (benchmarkPreviousBuildTestrun) {
            if (benchmarkPreviousBuildTestrun)
              console.log('Benchmark previous build done for: ' + benchmarkPreviousBuildTestrun.productName + '-' + benchmarkPreviousBuildTestrun.dashboardName + 'testrunId: ' + benchmarkPreviousBuildTestrun.testRunId);
            Benchmarks.setBenchmarkResultsFixedBaselineForTestRun(benchmarkPreviousBuildTestrun, function (benchmarkFixedBaselineTestrun) {
              if (benchmarkFixedBaselineTestrun)
                console.log('Benchmark fixed baseline done for: ' + benchmarkFixedBaselineTestrun.productName + '-' + benchmarkFixedBaselineTestrun.dashboardName + 'testrunId: ' + benchmarkFixedBaselineTestrun.testRunId);
              benchmarkFixedBaselineTestrun.save(function (err) {
                if (err) {
                  console.log(err);
                  callback(err);
                } else {
                  persistedTestRuns.push(benchmarkFixedBaselineTestrun);
                  callback();
                }
              });
            });
          });
        });
      }, function (err) {
        if (err)
          console.log(err);
        callback(persistedTestRuns);
      });
    });
  }
}
function testRunById(req, res) {
  Testrun.findOne({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName },
      { testRunId: req.params.testRunId }
    ]
  }).sort('-end').exec(function (err, testRun) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      if (testRun) {
        var testRunEpoch = testRun.toObject();
        testRunEpoch.startEpoch = testRun.startEpoch;
        testRunEpoch.endEpoch = testRun.endEpoch;
        //res.setHeader('Last-Modified', (new Date()).toUTCString()); //to prevent http 304's
        res.jsonp(testRunEpoch);
      } else {
        return res.status(404).send({ message: 'No test run with id ' + req.params.testRunId + 'has been found for this dashboard' });
      }
    }
  });
}
function refreshTestrun(req, res) {
  Testrun.findOne({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName },
      { testRunId: req.params.testRunId }
    ]
  }).exec(function (err, testRun) {
    if (err){
      return res.status(404).send({ message: 'No test run with id ' + req.params.testRunId + 'has been found for this dashboard' });
    }else{

      let newTestRun = new Testrun();

      newTestRun.start = testRun.start;
      newTestRun.end = testRun.end;
      newTestRun.productName = testRun.productName;
      newTestRun.productRelease = testRun.productRelease;
      newTestRun.dashboardName = testRun.dashboardName;
      newTestRun.testRunId = testRun.testRunId;
      newTestRun.completed = testRun.completed;
      newTestRun.annotations = testRun.annotations;
      newTestRun.humanReadableDuration = testRun.humanReadableDuration;
      newTestRun.rampUpPeriod = testRun.rampUpPeriod;
      newTestRun.buildResultsUrl = testRun.buildResultsUrl;

      testRun.remove(function(err){

        newTestRun.save(function(err, savedNewTestRun){

          if (err){
            return res.status(400).send({ message: 'Error while saving newTestRun:' + err.stack });
          }else {

            benchmarkAndPersistTestRunById(savedNewTestRun)
                .then(function (updatedTestRun) {
                  res.jsonp(updatedTestRun);
                });
          }
        })

      })
    }
  });
}
exports.getTestRunById = function (productName, dashboardName, testRunId, callback) {
  Testrun.findOne({
    $and: [
      { productName: productName },
      { dashboardName: dashboardName },
      { testRunId: testRunId }
    ]
  }).exec(function (err, testRun) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      if (testRun) {
        callback(testRun);
      } else {

        callback();
      }
    }
  });
};

let upsertTestRun = function(testRun){

  return new Promise((resolve, reject) => {

    Testrun.findOneAndUpdate({$and:[
      {productName: testRun.productName},
      {dashboardName: testRun.dashboardName},
      {testRunId: testRun.testRunId}
    ]}, {metrics: testRun.metrics,
        meetsRequirement: testRun.meetsRequirement,
        benchmarkResultFixedOK: testRun.benchmarkResultFixedOK,
        benchmarkResultPreviousOK: testRun.benchmarkResultPreviousOK,
        baseline: testRun.baseline,
        previousBuild: testRun.previousBuild,
        humanReadableDuration: humanReadbleDuration(testRun.end.getTime() - testRun.start.getTime())}
        , {upsert:true}, function(err, savedTestRun){
      if (err) {
        reject(err);
      } else {

        resolve(savedTestRun);
      }

    });
 });
}

function benchmarkAndPersistTestRunById(testRun) {

  return new Promise((resolve, reject) => {

    flushMemcachedForTestRun(testRun)
    .then(getDataForTestrun)
    .then(Requirements.setRequirementResultsForTestRun)
    .then(Benchmarks.setBenchmarkResultsPreviousBuildForTestRun)
    .then(Benchmarks.setBenchmarkResultsFixedBaselineForTestRun)
    .then(upsertTestRun)
    .then(function(completedTestrun){
      resolve(completedTestrun);
    })
    .catch(testRunErrorHandler);
  });
}

let testRunErrorHandler = function(err){

  console.log('Error in test run chain: ' + err.stack);
}


function flushMemcachedForTestRun(testRun, callback){

  return new Promise((resolve, reject) => {

    Product.findOne({ name: testRun.productName}).exec(function(err, product){

    if(err){
      reject(err);
    }else{

      Dashboard.findOne({$and:[{name: testRun.dashboardName}, {productId: product._id}]})
          .populate({path: 'metrics', options: { sort: { tag: 1, alias: 1 } } })
          .exec(function (err, dashboard) {
            if (err){
              reject(err);
            }else{

              _.each(dashboard.toObject().metrics, function(metric){

                _.each(metric.targets, function(target){

                  graphite.flushMemcachedKey(graphite.createMemcachedKey(Math.round(testRun.start / 1000), Math.round(testRun.end / 1000), target), function(){

                    });
                });

              });

            resolve(testRun);
            }

      });

      }
    });
  })

}


function getDataForTestrun(testRun) {

  return new Promise((resolve, reject) => {

    Product.findOne({ name: testRun.productName }).exec(function (err, product) {
    if (err)
      console.log(err);
    Dashboard.findOne({
      $and: [
        { productId: product._id },
        { name: testRun.dashboardName }
      ]
    }).populate('metrics').exec(function (err, dashboard) {
      if (err)
        console.log(err);
      var metrics = [];
      async.forEachLimit(dashboard.metrics, 16, function (metric, callbackMetric) {

        if(metric.requirementValue || metric.benchmarkValue) {

          let targets = [];
          let value;
          let start;
          /* if dashboard has startSteadyState configured and metric type = gradient use steady state period only */

          if (dashboard.startSteadyState && metric.type === 'Gradient') {

            start = new Date(testRun.start.getTime() + dashboard.startSteadyState * 1000);

          } else {

            /* if include ramp up is false, add ramp up period to start of test run */
            start = (testRun.rampUpPeriod && dashboard.includeRampUp === false) ? new Date(testRun.start.getTime() + testRun.rampUpPeriod * 1000) : testRun.start;

          }
          async.forEachLimit(metric.targets, 16, function (target, callbackTarget) {

            graphite.getGraphiteData(Math.round(start / 1000), Math.round(testRun.end / 1000), target, 900, function (body) {
              _.each(body, function (bodyTarget) {

                /* save value based on metric type */

                switch (metric.type) {

                  case 'Average':

                    value = calculateAverage(bodyTarget.datapoints);
                    break;

                  case 'Maximum':

                    value = calculateMaximum(bodyTarget.datapoints);
                    break;

                  case 'Minimum':

                    value = calculateMinimum(bodyTarget.datapoints);
                    break;

                  case 'Last':

                    value = getLastDatapoint(bodyTarget.datapoints);
                    break;

                  case 'Gradient':

                    value = calculateLinearFit(bodyTarget.datapoints);
                    break;

                }


                /* if target has values other than null values only, store it */
                if (value !== null) {
                  targets.push({
                    target: bodyTarget.target,
                    value: value
                  });
                }
              });
              callbackTarget();
            });
          }, function (err) {
            if (err)
              return next(err);
            if (targets.length > 0) {
              metrics.push({
                _id: metric._id,
                tags: metric.tags,
                alias: metric.alias,
                type: metric.type,
                benchmarkValue: metric.benchmarkValue,
                benchmarkOperator: metric.benchmarkOperator,
                requirementValue: metric.requirementValue,
                requirementOperator: metric.requirementOperator,
                targets: targets
              });

              targets = [];
            }

            callbackMetric();


          });
        }else{

          callbackMetric();

        }
      }, function (err) {
        if (err) {
          reject(err);
        }else {
          /* save metrics to test run */

              console.log('Retrieved data for:' + testRun.productName + '-' + testRun.dashboardName + 'testrunId: ' + testRun.testRunId);

              testRun.metrics = metrics;


              testRun.save(function(err, savedTestrun){

                if (err) {
                  reject(err);
                } else {

                  resolve(savedTestrun);

                }

              });
       }
      });
    });
  });
 });
}
function calculateAverage(datapoints) {
  var count = 0;
  var total = 0;

  _.each(datapoints, function (datapoint) {
    if (datapoint[0] !== null) {
      count++;
      total += datapoint[0];
    }
  });
  if (count > 0)
    return Math.round(total / count * 100) / 100;
  else
    return null;
}

function calculateMaximum(datapoints){

  var maximum = 0;

  for(var d=0;d<datapoints.length;d++){

    if (datapoints[d][0] > maximum)
      maximum = datapoints[d][0];
  }

  return maximum;
}

function calculateMinimum(datapoints){

  var minimum = Infinity;

  for(var d=0;d<datapoints.length;d++){

    if (datapoints[d][0] < minimum)
      minimum = datapoints[d][0];
  }

  return minimum;
}

function getLastDatapoint(datapoints){


  for(var d=datapoints.length-1;d>=0;--d){


    if(datapoints[d][0]!= null)
      return  Math.round((datapoints[d][0])*100)/100;
  }
}
function calculateLinearFit(datapoints){

  var data = [];

  for(var j=0;j< datapoints.length;j++){

    if(datapoints[j][0] !== null) {
      data.push([j, datapoints[j][0]]);
    }
  }

  var line = ss.linear_regression()
      .data(data)
      .line()

  var gradient = ss.linear_regression()
      .data(data)
      .m()
  //console.log('stijgings percentage: ' + (line(data.length-1)-line(0))/ line(0)) / data.length * 100;
  //console.log('gradient: ' + gradient * 100);
  //console.log('line(0): ' + line(0));
  //console.log('line(data.length-1): ' + line(data.length-1));

  return Math.round(((((line(data.length-1)-line(0))/ line(0)) / data.length) * 100 * 100)* 100) / 100;

}


function TempSaveTestruns(testruns,  callback) {

  var savedTesruns = [];

  _.each(testruns, function(testrun){
  var persistTestrun = new Testrun();
    persistTestrun.productName = testrun.productName;
    persistTestrun.dashboardName = testrun.dashboardName;
    persistTestrun.testRunId = testrun.testRunId;
    persistTestrun.start = testrun.start;
    persistTestrun.end = testrun.end;
    persistTestrun.eventIds = testrun.eventIds;
    persistTestrun.buildResultsUrl = testrun.buildResultsUrl;

    savedTesruns.push(persistTestrun);

    persistTestrun.save(function (err) {
      if (err) {
        console.log(err);
        callback(err);
      } else {
        //callback(persistTestrun);
      }
    });
  });

  setTimeout(function(){

    callback(savedTesruns);
  },500);
}

function saveTestrun(testrun, metrics, callback) {
  getPreviousBuild(testrun.productName, testrun.dashboardName, testrun.testRunId, function (previousBuild) {
    var persistTestrun = new Testrun();
    persistTestrun.productName = testrun.productName;
    persistTestrun.dashboardName = testrun.dashboardName;
    persistTestrun.testRunId = testrun.testRunId;
    persistTestrun.start = testrun.start;
    persistTestrun.end = testrun.end;
    persistTestrun.baseline = testrun.baseline;
    persistTestrun.previousBuild = previousBuild;
    persistTestrun.buildResultsUrl = testrun.buildResultsUrl;
    persistTestrun.eventIds = testrun.eventIds;
    persistTestrun.metrics = metrics;
    persistTestrun.save(function (err) {
      if (err) {
        console.log(err);
        callback(err);
      } else {
        callback(persistTestrun);
      }
    });
  });
}

function updateAllDashboardTestRuns(req, res){

  var regExpDashboardName = new RegExp(req.params.oldDashboardName, 'igm');

  Testrun.find({
    $and: [
      { productName: req.params.oldProductName },
      { dashboardName: req.params.oldDashboardName }
    ]}).exec(function(err, testruns){
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {

      _.each(testruns, function(testrun){


        testrun.dashboardName = req.params.newDashboardName;
        testrun.testRunId = testrun.testRunId.replace(regExpDashboardName, req.params.newDashboardName);

        testrun.save(function (err) {
          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          } else {
            //res.jsonp(testrun);
          }
        });
      });

      res.jsonp(testruns);
    }



  });
}

function updateAllProductTestRuns(req, res){

  var regExpProductName = new RegExp(req.params.oldProductName, 'igm');

  Testrun.find({productName: req.params.oldProductName}).exec(function(err, testruns){
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {

      _.each(testruns, function(testrun){


        testrun.productName = req.params.newProductName;
        testrun.testRunId = testrun.testRunId.replace(regExpProductName,req.params.newProductName);

        testrun.save(function (err) {
          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          } else {
            //res.jsonp(testrun);
          }
        });
      });

      res.jsonp(testruns);
    }
  });
}
