/*jshint maxerr: 10000 */
'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), errorHandler = require('./errors.server.controller'), Event = mongoose.model('Event'), Testrun = mongoose.model('Testrun'), Dashboard = mongoose.model('Dashboard'), Product = mongoose.model('Product'), _ = require('lodash'), graphite = require('./graphite.server.controller'), Utils = require('./utils.server.controller'), Requirements = require('./testruns.requirements.server.controller'), Benchmarks = require('./testruns.benchmarks.server.controller'), Metric = mongoose.model('Metric'), async = require('async');
exports.benchmarkAndPersistTestRunById = benchmarkAndPersistTestRunById;
exports.testRunsForDashboard = testRunsForDashboard;
exports.testRunsForProduct = testRunsForProduct;
exports.deleteTestRunById = deleteTestRunById;
exports.testRunById = testRunById;
exports.refreshTestrun = refreshTestrun;
exports.runningTest = runningTest;
exports.updateTestrunsResults = updateTestrunsResults;
exports.saveTestRun = saveTestRun;
exports.updateAllDashboardTestRuns = updateAllDashboardTestRuns;
exports.updateAllProductTestRuns = updateAllProductTestRuns;

function saveTestRun(testRun, callback) {
  /* Save updated test run */
  Testrun.findById(testRun._id, function (err, savedTestRun) {
    if (err)
      console.log(err);
    if (!savedTestRun)
      console.log('Could not load Document');
    else {
      savedTestRun.metrics = testRun.metrics;
      savedTestRun.baseline = testRun.baseline;
      savedTestRun.benchmarkResultFixedOK = testRun.benchmarkResultFixedOK;
      savedTestRun.benchmarkResultPreviousOK = testRun.benchmarkResultPreviousOK;
      savedTestRun.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          callback(savedTestRun);
        }
      });
    }
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
        updateMetricInTestrun(req.params.metricId, testRun, function (testRunWithUpdatedMetrics) {
          if (req.params.updateRequirements === 'true' && req.params.updateBenchmarks === 'true') {
            Requirements.updateRequirementResults(testRunWithUpdatedMetrics, function (updatedRequirementsTestrun) {
              Benchmarks.updateBenchmarkResults(updatedRequirementsTestrun, function (updatedBenchmarkTestrun) {
                console.log('Updated requiremenst and benchmarks for: ' + updatedBenchmarkTestrun.testRunId);
                callback();
              });
            });
          } else {
            if (req.params.updateRequirements === 'true' && req.params.updateBenchmarks === 'false') {
              Requirements.updateRequirementResults(testRunWithUpdatedMetrics, function (updatedTestrun) {
                console.log('Updated requirememts for: ' + updatedTestrun.testRunId);
                callback();
              });
            }
            if (req.params.updateRequirements === 'false' && req.params.updateBenchmarks === 'true') {
              Benchmarks.updateBenchmarkResults(testRunWithUpdatedMetrics, function (updatedTestrun) {
                console.log('Updated benchmarks for: ' + updatedTestrun.testRunId);
                callback();
              });
            }
          }
        });
      }, function (err) {
        if (err)
          console.log(err);
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
function updateMetricInTestrun(metricId, testRun, callback) {
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
    Testrun.findById(testRun._id, function (err, savedTestRun) {
      if (err)
        console.log(err);
      if (!savedTestRun)
        console.log('Could not load Document');
      else {
        savedTestRun.metrics = updatedMetrics;
        savedTestRun.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            callback(savedTestRun);
          }
        });
      }
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
  }).sort('-end').exec(function (err, testRun) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      if (testRun) {
        testRun.remove(function (err) {
          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
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
  Event.find({productName: req.params.productName}).sort({eventTimestamp: 1}).exec(function (err, events) {
    if (err) {
      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    } else {
      createTestRunSummaryFromEvents(events, function (testRunSummary) {
        res.jsonp(testRunSummary);
      });
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
  Testrun.find({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName }
    ]
  }).sort('-end').exec(function (err, testRuns) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      if (testRuns.length > 0) {
        res.jsonp(testRuns);
      } else {
        Event.find({
          $and: [
            { productName: req.params.productName },
            { dashboardName: req.params.dashboardName }
          ]
        }).sort({ eventTimestamp: 1 }).exec(function (err, events) {
          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          } else {
            createTestrunFromEvents(req.params.productName, req.params.dashboardName, events, function (eventsTestruns) {
              /* if benchmarking is not enabled, no need to persist the test runs! */
              //if (req.params.useInBenchmark === 'false') {
                res.jsonp(eventsTestruns.reverse());
              //} else {
              //  /* persist test runs that have not yet been persisted */
              //  persistTestrunsFromEvents(testRuns, eventsTestruns, function (persistedTestRuns) {
              //    res.jsonp(persistedTestRuns);
              //  });
              //}
            });
          }
        });
      }
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
        Event.find({
          $and: [
            { productName: req.params.productName },
            { dashboardName: req.params.dashboardName },
            { testRunId: req.params.testRunId }
          ]
        }).sort('-end').exec(function (err, events) {
          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          } else {
            createTestrunFromEvents(req.params.productName, req.params.dashboardName, events, function (eventsTestruns) {
              res.jsonp(eventsTestruns[0]);
            });
          }
        });
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
    if (err)
      console.log(err);
    benchmarkAndPersistTestRunById(req.params.productName, req.params.dashboardName, testRun, function (persistedTestrun) {
      res.jsonp(persistedTestrun);
    });
  });
}
exports.getTestRunById = function (productName, dashboardName, testRunId, callback) {
  Testrun.findOne({
    $and: [
      { productName: productName },
      { dashboardName: dashboardName },
      { testRunId: testRunId }
    ]
  }).sort('-end').exec(function (err, testRun) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      if (testRun) {
        callback(testRun);
      } else {
        Event.find({
          $and: [
            { productName: productName },
            { dashboardName: dashboardName },
            { testRunId: testRunId }
          ]
        }).sort('-end').exec(function (err, events) {
          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          } else {
            if (events.length > 0) {
              createTestrunFromEvents(productName, dashboardName, events, function(testRun){
                benchmarkAndPersistTestRunById(productName, dashboardName, testRun[0], function(persistedTestRun){
                  callback(persistedTestRun);
                });
              });
            } else {
              callback(null);
            }
          }
        });
      }
    }
  });
};
function benchmarkAndPersistTestRunById(productName, dashboardName, testRun, callback) {
  Testrun.findOne({ testRunId: testRun.testRunId }).exec(function (err, savedTestrun) {
    if (err) {
      console.log(err);
    } else {
      if (savedTestrun) {
        savedTestrun.remove(function (err) {
          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          } else {
            console.log('removed testrun: ' + savedTestrun.testRunId);
            getDataForTestrun(productName, dashboardName, testRun, function (metrics) {
              if (metrics)
                console.log('Data retrieved for:' + productName + '-' + dashboardName);
              saveTestrun(testRun, metrics, function (savedTestrun) {
                if (savedTestrun)
                  console.log('Testrun saved retrieved for:' + productName + '-' + dashboardName + 'testrunId: ' + savedTestrun.testRunId);
                Requirements.setRequirementResultsForTestRun(savedTestrun, function (requirementsTestrun) {
                  if (requirementsTestrun)
                    console.log('Requirements set for:' + productName + '-' + dashboardName + 'testrunId: ' + requirementsTestrun.testRunId);
                  Benchmarks.setBenchmarkResultsPreviousBuildForTestRun(requirementsTestrun, function (benchmarkPreviousBuildTestrun) {
                    if (benchmarkPreviousBuildTestrun)
                      console.log('Benchmark previous build done for:' + productName + '-' + dashboardName + 'testrunId: ' + benchmarkPreviousBuildTestrun.testRunId);
                    Benchmarks.setBenchmarkResultsFixedBaselineForTestRun(benchmarkPreviousBuildTestrun, function (benchmarkFixedBaselineTestrun) {
                      if (benchmarkFixedBaselineTestrun)
                        console.log('Benchmark fixed baseline done for:' + productName + '-' + dashboardName + 'testrunId: ' + benchmarkFixedBaselineTestrun.testRunId);
                      /* Save updated test run */
                      benchmarkFixedBaselineTestrun.save(function (err) {
                        if (err) {
                          console.log('error');
                        } else {
                          console.log('Complete testrun saved for:' + benchmarkFixedBaselineTestrun.productName + '-' + benchmarkFixedBaselineTestrun.dashboardName + 'testrunId: ' + benchmarkFixedBaselineTestrun.testRunId);
                          callback(benchmarkFixedBaselineTestrun);
                        }
                      });  //Testrun.findById(benchmarkFixedBaselineTestrun._id, function(err, savedTestRun) {
                           //    if (err) console.log(err);
                           //    if (!savedTestRun)
                           //        console.log('Could not load Document');
                           //    else {
                           //
                           //        savedTestRun = benchmarkFixedBaselineTestrun;
                           //
                           //        savedTestRun.save(function(err) {
                           //            if (err) {
                           //                console.log('error')
                           //            }else {
                           //                console.log('Complete testrun saved for:' + productName + '-' + dashboardName + 'testrunId: ' + savedTestRun.testRunId);
                           //                callback(savedTestRun);
                           //            }
                           //        });
                           //    }
                           //});
                    });
                  });
                });
              });
            });
          }
        });
      } else {
        getDataForTestrun(productName, dashboardName, testRun, function (metrics) {
          if (metrics)
            console.log('Data retrieved for:' + productName + '-' + dashboardName);
          saveTestrun(testRun, metrics, function (savedTestrun) {
            if (savedTestrun)
              console.log('Testrun saved for: ' + productName + '-' + dashboardName + 'testrunId: ' + savedTestrun.testRunId);
            Requirements.setRequirementResultsForTestRun(savedTestrun, function (requirementsTestrun) {
              if (requirementsTestrun)
                console.log('Requirements set for: ' + productName + '-' + dashboardName + 'testrunId: ' + requirementsTestrun.testRunId);
              Benchmarks.setBenchmarkResultsPreviousBuildForTestRun(requirementsTestrun, function (benchmarkPreviousBuildTestrun) {
                if (benchmarkPreviousBuildTestrun)
                  console.log('Benchmark previous build done for: ' + productName + '-' + dashboardName + 'testrunId: ' + benchmarkPreviousBuildTestrun.testRunId);
                Benchmarks.setBenchmarkResultsFixedBaselineForTestRun(benchmarkPreviousBuildTestrun, function (benchmarkFixedBaselineTestrun) {
                  if (benchmarkFixedBaselineTestrun)
                    console.log('Benchmark fixed baseline done for: ' + productName + '-' + dashboardName + 'testrunId: ' + benchmarkFixedBaselineTestrun.testRunId);
                  /* Save updated test run */
                  Testrun.findById(benchmarkFixedBaselineTestrun._id, function (err, savedTestRun) {
                    if (err)
                      console.log(err);
                    if (!savedTestRun)
                      console.log('Could not load Document');
                    else {
                      savedTestRun = benchmarkFixedBaselineTestrun;
                      savedTestRun.save(function (err) {
                        if (err) {
                          console.log('error');
                        } else {
                          console.log('Complete testrun saved for:' + productName + '-' + dashboardName + 'testrunId: ' + savedTestRun.testRunId);
                          callback(savedTestRun);
                        }
                      });
                    }
                  });
                });
              });
            });
          });
        });
      }
    }
  });
}
function getDataForTestrun(productName, dashboardName, testRun, callback) {
  Product.findOne({ name: productName }).exec(function (err, product) {
    if (err)
      console.log(err);
    Dashboard.findOne({
      $and: [
        { productId: product._id },
        { name: dashboardName }
      ]
    }).populate('metrics').exec(function (err, dashboard) {
      if (err)
        console.log(err);
      var metrics = [];
      async.forEachLimit(dashboard.metrics, 16, function (metric, callbackMetric) {
        var targets = [];
        var value
        async.forEachLimit(metric.targets, 16, function (target, callbackTarget) {
          graphite.getGraphiteData(Math.round(testRun.start / 1000), Math.round(testRun.end / 1000), target, 900, function (body) {
            _.each(body, function (bodyTarget) {

              value = calculateAverage(bodyTarget.datapoints);
              /* if target has values other than null values only, store it */
              if(value !== null) {
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
          if(targets.length > 0) {
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
      }, function (err) {
        if (err)
          return next(err);
        callback(metrics);
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
    persistTestrun.buildResultKey = testrun.buildResultKey;
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
function getPreviousBuild(productName, dashboardName, testrunId, callback) {
  var previousBuild;
  Event.find({
    $and: [
      { productName: productName },
      { dashboardName: dashboardName }
    ]
  }).sort({ eventTimestamp: -1 }).exec(function (err, events) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      createTestrunFromEvents(productName, dashboardName, events, function (testruns) {
        _.each(testruns, function (testrun, i) {
          if (testrun.testRunId === testrunId) {
            if (i + 1 === testruns.length) {
              return null;
            } else {
              previousBuild = testruns[i + 1].testRunId;
              return previousBuild;
            }
          }
        });
        callback(previousBuild);
      });
    }
  });
}
function createTestrunFromEvents(productName, dashboardName, events, callback) {
  var testRuns = [];
  var baseline;
  var dashboardBaseline;
  Product.findOne({ name: productName }).exec(function (err, product) {
    if (err)
      console.log(err);
    Dashboard.findOne({
      $and: [
        { productId: product._id },
        { name: dashboardName }
      ]
    }).exec(function (err, dashboard) {
      if (err) {
        console.log(err);
      } else {
        dashboardBaseline = dashboard.baseline ? dashboard.baseline : baseline;
        for (var i = 0; i < events.length; i++) {
          if (events[i].eventDescription === 'start') {
            for (var j = 0; j < events.length; j++) {
              if (events[j].eventDescription === 'end' && events[j].testRunId == events[i].testRunId) {
                /* If no baseline has been set for this dashboard, set the first test run as baseline*/
                if (!dashboardBaseline && !baseline) {
                  baseline = events[i].testRunId;
                  dashboardBaseline = events[i].testRunId;
                } else {
                  baseline = dashboardBaseline;
                }
                if (events[i].buildResultKey) {
                  testRuns.push({
                    start: events[i].eventTimestamp,
                    startEpoch: events[i].eventTimestamp.getTime(),
                    end: events[j].eventTimestamp,
                    endEpoch: events[j].eventTimestamp.getTime(),
                    productName: events[i].productName,
                    dashboardName: events[i].dashboardName,
                    testRunId: events[i].testRunId,
                    buildResultKey: events[i].buildResultKey,
                    eventIds: [
                      events[i].id,
                      events[j].id
                    ],
                    //meetsRequirement: null,
                    //benchmarkResultFixedOK: null,
                    //benchmarkResultPreviousOK: null,
                    baseline: baseline
                  });
                } else {
                  testRuns.push({
                    start: events[i].eventTimestamp,
                    startEpoch: events[i].eventTimestamp.getTime(),
                    end: events[j].eventTimestamp,
                    endEpoch: events[j].eventTimestamp.getTime(),
                    productName: events[i].productName,
                    dashboardName: events[i].dashboardName,
                    testRunId: events[i].testRunId,
                    eventIds: [
                      events[i].id,
                      events[j].id
                    ],
                    //meetsRequirement: null,
                    //benchmarkResultFixedOK: null,
                    //benchmarkResultPreviousOK: null,
                    baseline: baseline
                  });
                }
                break;
              }
            }
          }
        }
        /* If no baseline has been set for this dashboard, set the first test run as baseline*/
        if (!dashboard.baseline && testRuns) {
          dashboard.baseline = dashboardBaseline;
          dashboard.save(function (err) {
            if (err) {
              console.log(err);
            } else {
              callback(testRuns);
            }
          });
        } else {
          callback(testRuns);
        }
      }
    });
  });
}
/**
 * Show the current Testrun
 */
function runningTest(req, res) {
  var currentTime = new Date();
  var anyEventFound = false;
  Event.find({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName }
    ]
  }).sort({ eventTimestamp: -1 }).lean().exec(function (err, events) {
    if (err)
      throw err;
    for (var i = 0; i < events.length; i++) {
      if (events[i].eventDescription === 'start') {
        var endEventFound = false;
        var tooOld = false;
        anyEventFound = true;
        for (var j = 0; j < events.length; j++) {
          if (events[i].testRunId === events[j].testRunId && events[j].eventDescription === 'end')
            endEventFound = true;
        }
        if (endEventFound === false && currentTime.getTime() - events[i].eventTimestamp.getTime() < 176400000) {
          var returnEvent = events[i];
          res.jsonp(returnEvent);
          break;  /* If running test is older than 48 hours, leave it*/
        } else if (currentTime.getTime() - events[i].eventTimestamp.getTime() > 176400000) {
          tooOld = true;
        }
      }
    }
    if (endEventFound === true || tooOld === true || anyEventFound === false) {
      res.jsonp({});
    }
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
