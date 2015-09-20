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

function updateFixedBaselineBenchmark(req, res){

    var testRunToUpdate = new Testrun(req.body);

    setBenchmarkResultsFixedBaselineForTestRun(testRunToUpdate, function(updatedBenchmark){

        /* Save updated test run */
        Testrun.findById(updatedBenchmark._id, function(err, savedTestRun) {
            if (err) console.log(err);
            if (!savedTestRun)
                console.log('Could not load Document');
            else {

                savedTestRun.metrics = updatedBenchmark.metrics;
                savedTestRun.baseline = updatedBenchmark.baseline;
                savedTestRun.benchmarkResultFixedOK = updatedBenchmark.benchmarkResultFixedOK;


                savedTestRun.save(function(err) {
                    if (err) {
                        console.log(err)
                    }else {
                        res.jsonp(savedTestRun);                        }
                });
            }
        });

    });



}
function setBenchmarkResultsFixedBaselineForTestRun(testRun, callback) {

    var benchmarkDone = false;

    if (testRun.baseline && testRun.baseline !== testRun.testRunId) {

        Testruns.getTestRunById(testRun.productName, testRun.dashboardName, testRun.baseline, function (fixedBaseline) {

            if(fixedBaseline) {
                benchmarkTestRuns(testRun, fixedBaseline, 'benchmarkResultFixedOK', function(updatedTestrun){

                    callback(updatedTestrun);

                })

            }else{

                testRun.benchmarkResultFixedOK = null;
                callback(testRun);
            }
        })


    } else {

        testRun.benchmarkResultFixedOK = null;
        callback(testRun);
    }
}

function setBenchmarkResultsPreviousBuildForTestRun(testRun, callback){

    if(testRun.previousBuild){

        Testruns.getTestRunById(testRun.productName, testRun.dashboardName, testRun.previousBuild, function(previousBuildBaseline){

            if(previousBuildBaseline) {

                benchmarkTestRuns(testRun, previousBuildBaseline, 'benchmarkResultPreviousOK', function (updatedTestrun) {

                    callback(updatedTestrun);

                })

            }else{

                testRun.benchmarkResultPreviousOK = null;
                callback(testRun);
            }
        })

    }else{

        testRun.benchmarkResultPreviousOK = null;
        callback(testRun);
    }


}


function benchmarkTestRuns (benchmark, baseline, benchmarkType, callback){

    var benchmarkDone = false;
    var updatedTargets = [];
    var updatedMetrics = [];


    _.each(benchmark.metrics, function (benchmarkMetric) {

        if(benchmarkMetric.benchmarkValue){

            var baselineMetric = _.filter(baseline.metrics, function(metric){
                return metric._id.toString() === benchmarkMetric._id.toString();
            });


             _.each(benchmarkMetric.targets, function (benchmarkMetricTarget) {

                 if(baselineMetric.length > 0) {

                     _.each(baselineMetric[0].targets, function (baselineMetricTarget) {

                         if (benchmarkMetricTarget.target === baselineMetricTarget.target) {

                             benchmarkDone = true;

                             if (benchmarkType === 'benchmarkResultPreviousOK') {

                                 benchmarkMetricTarget.benchmarkPreviousValue = baselineMetricTarget.value;

                             }else{

                                 benchmarkMetricTarget.benchmarkFixedValue = baselineMetricTarget.value;

                             }

                             benchmarkMetricTarget[benchmarkType] = evaluateBenchmark(benchmarkMetricTarget.value, baselineMetricTarget.value, benchmarkMetric.benchmarkOperator, benchmarkMetric.benchmarkValue);

                             updatedTargets.push(benchmarkMetricTarget)

                         }
                     })

                 }else{

                     updatedTargets.push(benchmarkMetricTarget);

                 }


             })

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

            }else{

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


        }else{

                updatedMetrics.push(benchmarkMetric);

        }




        updatedTargets = [];

    })

    benchmark.metrics = updatedMetrics;

    if(benchmarkDone)
        benchmark[benchmarkType] = getConsolidateBenchmarkResults(benchmark.metrics, benchmarkType);
    else
        benchmark[benchmarkType] = null;

    callback(benchmark);



}


function getConsolidateBenchmarkResults(targets, benchmarkProp){

    var benchmarkResult = true;

    _.each(targets, function(target){


            if(target[benchmarkProp] === false) {

                benchmarkResult = false;
                return benchmarkResult;
            }

    })

    return benchmarkResult;
}



function evaluateBenchmark(value, baselineValue, benchmarkOperator, benchmarkValue){

    var result = false;

    if(benchmarkOperator === '>'){

        if(value - baselineValue < benchmarkValue ){

            result = true;
        }

    }else{

        if(baselineValue - value < benchmarkValue ){

            result = true;
        }

    }


    return result;
}



