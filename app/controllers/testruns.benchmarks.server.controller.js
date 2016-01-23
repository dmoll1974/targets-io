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
    Testruns = require('./testruns.server.controller.js'),
    async = require('async');

exports.setBenchmarkResultsPreviousBuildForTestRun = setBenchmarkResultsPreviousBuildForTestRun;
exports.setBenchmarkResultsFixedBaselineForTestRun = setBenchmarkResultsFixedBaselineForTestRun;
exports.updateFixedBaselineBenchmark = updateFixedBaselineBenchmark;
exports.updateBenchmarkResults = updateBenchmarkResults;
function updateBenchmarkResults(testRun) {

  return new Promise((resolve, reject) => {

    setBenchmarkResultsFixedBaselineForTestRun(testRun)
    .then(setBenchmarkResultsPreviousBuildForTestRun)
    .then(function (updatedTestRun) {
      /* Save updated test run */

      Testrun.findOneAndUpdate({
            $and: [
              {productName: updatedTestRun.productName},
              {dashboardName: updatedTestRun.dashboardName},
              {testRunId: updatedTestRun.testRunId}
            ]
          }, {benchchmarkResultFixedOK: updatedTestRun.benchmarkResultFixedOK}
          , {upsert: true}, function (err, savedTestRun) {
            if(err !== null) {
              reject(err);
            } else {
              resolve(savedTestRun);
            }

          });
    });
  });
}

function saveTestRunAfterBenchmark(testRun, callback) {
  /* Save updated test run */
  Testrun.findById(testRun._id, function (err, savedTestRun) {
    if(err !== null)
      console.log(err);
    if (!savedTestRun)
      console.log('Could not load Document');
    else {
      savedTestRun.metrics = testRun.metrics;
      savedTestRun.baseline = testRun.baseline;
      savedTestRun.benchmarkResultFixedOK = testRun.benchmarkResultFixedOK;
      savedTestRun.benchmarkResultPreviousOK = testRun.benchmarkResultPreviousOK;
      savedTestRun.save(function (err) {
        if(err !== null) {
          console.log(err);
        } else {
          callback(savedTestRun);
        }
      });
    }
  });
}
function updateFixedBaselineBenchmark(req, res) {
  var testRunToUpdate = new Testrun(req.body);
  setBenchmarkResultsFixedBaselineForTestRun(testRunToUpdate)
  .then(function (updatedBenchmark) {
    /* Save updated test run */

    Testrun.findOneAndUpdate({$and:[
          {productName: testRunToUpdate.productName},
          {dashboardName: testRunToUpdate.dashboardName},
          {testRunId: testRunToUpdate.testRunId}
        ]}, {benchchmarkResultFixedOK: testRun.benchmarkResultFixedOK}
        , {upsert:true}, function(err, savedTestRun){
          if(err !== null) {
            console.log(err);
          } else {
            res.jsonp(savedTestRun);
          }

        });
   });
}
function setBenchmarkResultsFixedBaselineForTestRun(testRun) {
  return new Promise((resolve, reject) => {

    getBaseline(testRun)
    .then(function(testRunIncludingFixedBaseline) {

      var benchmarkDone = false;
      if (testRunIncludingFixedBaseline.baseline && testRunIncludingFixedBaseline.baseline !== testRunIncludingFixedBaseline.testRunId) {
        Testruns.getTestRunById(testRunIncludingFixedBaseline.productName, testRunIncludingFixedBaseline.dashboardName, testRunIncludingFixedBaseline.baseline, function (fixedBaseline) {
          if (fixedBaseline) {
            benchmarkTestRuns(testRunIncludingFixedBaseline, fixedBaseline, 'benchmarkResultFixedOK', function (updatedTestrun) {

              console.log('Set benchmark fixed baseline for:' + updatedTestrun.productName + '-' + updatedTestrun.dashboardName + 'testrunId: ' + updatedTestrun.testRunId);
              resolve(updatedTestrun);
            });
          } else {
            testRun.benchmarkResultFixedOK = null;
            resolve(testRun);
          }
        });
      } else {
        testRun.benchmarkResultFixedOK = null;
        resolve(testRun);
      }
    });
  });
}
function setBenchmarkResultsPreviousBuildForTestRun(testRun) {
  return new Promise((resolve, reject) => {

    getPreviousBuild(testRun)
    .then(function(testRunIncludingPreviousBuild){
      if (testRunIncludingPreviousBuild.previousBuild) {
        Testruns.getTestRunById(testRunIncludingPreviousBuild.productName, testRunIncludingPreviousBuild.dashboardName, testRunIncludingPreviousBuild.previousBuild, function (previousBuildBaseline) {
          if (previousBuildBaseline) {
            benchmarkTestRuns(testRunIncludingPreviousBuild, previousBuildBaseline, 'benchmarkResultPreviousOK', function (updatedTestrun) {
              console.log('Set benchmark previous build for:' + updatedTestrun.productName + '-' + updatedTestrun.dashboardName + 'testrunId: ' + updatedTestrun.testRunId);
              resolve(updatedTestrun);
            });
          } else {
            testRun.benchmarkResultPreviousOK = null;
            resolve(testRun);
          }
        });
      } else {
        testRun.benchmarkResultPreviousOK = null;
        resolve(testRun);
      }
    });
  });
}
function benchmarkTestRuns(benchmark, baseline, benchmarkType, callback) {
  var benchmarkDone = false;
  var targetBenchmarked;
  var updatedTargets = [];
  var updatedMetrics = [];
  _.each(benchmark.metrics, function (benchmarkMetric) {
    if (benchmarkMetric.benchmarkValue) {
      var baselineMetric = _.filter(baseline.metrics, function (metric) {
        return metric._id.toString() === benchmarkMetric._id.toString();
      });
      _.each(benchmarkMetric.targets, function (benchmarkMetricTarget) {
        targetBenchmarked = false;
        if (baselineMetric.length > 0) {
          _.each(baselineMetric[0].targets, function (baselineMetricTarget) {
            if (benchmarkMetricTarget.target === baselineMetricTarget.target) {
              benchmarkDone = true;
              targetBenchmarked = true;
              if (benchmarkType === 'benchmarkResultPreviousOK') {
                benchmarkMetricTarget.benchmarkPreviousValue = baselineMetricTarget.value;
              } else {
                benchmarkMetricTarget.benchmarkFixedValue = baselineMetricTarget.value;
              }
              benchmarkMetricTarget[benchmarkType] = evaluateBenchmark(benchmarkMetricTarget.value, baselineMetricTarget.value, benchmarkMetric.benchmarkOperator, benchmarkMetric.benchmarkValue);
              updatedTargets.push(benchmarkMetricTarget);
            }
          });

          if(targetBenchmarked === false){

            updatedTargets.push(benchmarkMetricTarget);

          }

        } else {
          updatedTargets.push(benchmarkMetricTarget);
        }
      });
      if (benchmarkType === 'benchmarkResultPreviousOK') {
        updatedMetrics.push({
          _id: benchmarkMetric._id,
          tags: benchmarkMetric.tags,
          alias: benchmarkMetric.alias,
          type: benchmarkMetric.type,
          meetsRequirement: benchmarkMetric.meetsRequirement,
          requirementOperator: benchmarkMetric.requirementOperator,
          requirementValue: benchmarkMetric.requirementValue,
          benchmarkOperator: benchmarkMetric.benchmarkOperator,
          benchmarkValue: benchmarkMetric.benchmarkValue,
          targets: updatedTargets,
          benchmarkResultPreviousOK: getConsolidateBenchmarkResults(updatedTargets, benchmarkType),
          benchmarkResultFixedOK: benchmarkMetric.benchmarkResultFixedOK
        });
      } else {
        updatedMetrics.push({
          _id: benchmarkMetric._id,
          tags: benchmarkMetric.tags,
          alias: benchmarkMetric.alias,
          type: benchmarkMetric.type,
          meetsRequirement: benchmarkMetric.meetsRequirement,
          requirementOperator: benchmarkMetric.requirementOperator,
          requirementValue: benchmarkMetric.requirementValue,
          benchmarkOperator: benchmarkMetric.benchmarkOperator,
          benchmarkValue: benchmarkMetric.benchmarkValue,
          targets: updatedTargets,
          benchmarkResultFixedOK: getConsolidateBenchmarkResults(updatedTargets, benchmarkType),
          benchmarkResultPreviousOK: benchmarkMetric.benchmarkResultPreviousOK
        });
      }
    } else {
      updatedMetrics.push(benchmarkMetric);
    }
    updatedTargets = [];
  });
  benchmark.metrics = updatedMetrics;
  if (benchmarkDone)
    benchmark[benchmarkType] = getConsolidateBenchmarkResults(benchmark.metrics, benchmarkType);
  else
    benchmark[benchmarkType] = null;

  callback(benchmark);
}
function getConsolidateBenchmarkResults(targets, benchmarkProp) {
  var benchmarkResult = true;
  _.each(targets, function (target) {
    if (target[benchmarkProp] === false) {
      benchmarkResult = false;
      return benchmarkResult;
    }
  });
  return benchmarkResult;
}
function evaluateBenchmark(value, baselineValue, benchmarkOperator, benchmarkValue) {
  var result = false;
  if (benchmarkOperator === '>') {
    if (value - baselineValue < benchmarkValue) {
      result = true;
    }
  } else {
    if (baselineValue - value < benchmarkValue) {
      result = true;
    }
  }
  return result;
}

  let getBaseline = function(testRun) {

    return new Promise((resolve, reject) => {

      Product.findOne({name: testRun.productName}).exec(function (err, product) {
        if(err !== null) {
          reject(err);
        }else {
          Dashboard.findOne({
            $and: [
              {productId: product._id},
              {name: testRun.dashboardName}
            ]
          }).exec(function (err, dashboard) {

            if(err !== null) {
              reject(err);
            } else {
              /* if baseline has been set for dashboard, return baeline */
              if (dashboard.baseline) {

                testRun.baseline = dashboard.baseline;
                resolve(testRun);
                /* else set current testRunId as baseline and return null */
              } else {

                dashboard.baseline = testRun.testRunId;
                dashboard.save(function (err, updatedDashboard) {

                  if(err !== null) {
                    reject(err);
                  } else {
                    resolve(testRun);
                  }
                });

              }
            }
          })
        }
      })

    })
  }

  let getPreviousBuild = function(testRun) {

    return new Promise((resolve, reject) => {


      Testrun.find({
        $and: [
          {productName: testRun.productName},
          {dashboardName: testRun.dashboardName},
          {completed: true}
        ]
      }).sort({end: -1}).exec(function (err, savedTestRuns) {
        if(err !== null) {
          reject(err);
        } else {

          var updatedTestRun = new Testrun(testRun);

          var index = savedTestRuns.map(function(savedTestRun){return savedTestRun.testRunId}).indexOf(testRun.testRunId);

          if(savedTestRuns.length > 1 && index < savedTestRuns.length -1){

            updatedTestRun.previousBuild = savedTestRuns[index + 1].testRunId;
          }

          resolve(updatedTestRun);

        }
      });
    })
  }
