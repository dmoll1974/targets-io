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

    async = require('async');


exports.updateTestRunRequirementForMetric = updateTestRunRequirementForMetric;

/**
 * select test runs for dashboard
 */
exports.testRunsForDashboard = function(req, res) {

    Testrun.find({ $and: [ { productName: req.params.productName }, { dashboardName: req.params.dashboardName } ] }).sort('-end').exec(function(err, testRuns) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            Event.find({$and: [{productName: req.params.productName}, {dashboardName: req.params.dashboardName}]}).sort('-eventTimestamp').exec(function (err, events) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {

                    createTestrunFromEvents(req.params.productName, req.params.dashboardName,events, function(eventsTestruns){
                        res.jsonp(addTestrunsFromEvents(testRuns, eventsTestruns));
                    });

                }

            });
        }
    });

    function addTestrunsFromEvents(testRuns, testRunsFromEvents){

        _.each(testRunsFromEvents, function (testRunFromEvents){

            var exists = false;

            _.each(testRuns, function (testRun){

                if (testRun.testRunId === testRunFromEvents.testRunId ){
                    exists = true;
                    return exists;
                }

            })

            if (exists === false) testRuns.push(testRunFromEvents);
        })

        return testRuns.sort(Utils.dynamicSort('-start'));

    }
  };

exports.deleteTestRunById = function (req, res) {

    Testrun.findOne({$and: [{productName: req.params.productName}, {dashboardName: req.params.dashboardName}, {testRunId: req.params.testRunId}]}).sort('-end').exec(function (err, testRun) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            if (testRun) {

                testRun.remove(function (err) {

                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                })
            }
        }

    });
}

exports.testRunById = function(req, res) {

    Testrun.findOne({ $and: [ { productName: req.params.productName }, { dashboardName: req.params.dashboardName },{ testRunId: req.params.testRunId }  ] }).sort('-end').exec(function(err, testRun) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            if(testRun) {
                var testRunEpoch = testRun.toObject();
                testRunEpoch.startEpoch = testRun.startEpoch;
                testRunEpoch.endEpoch = testRun.endEpoch;
                res.jsonp(testRunEpoch);
            }else{

                Event.find({ $and: [ { productName: req.params.productName }, { dashboardName: req.params.dashboardName },{ testRunId: req.params.testRunId }  ] }).sort('-end').exec(function(err, events) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {

                        createTestrunFromEvents(req.params.productName, req.params.dashboardName,events, function(eventsTestruns) {

                            res.jsonp(eventsTestruns[0]);

                        });
                    }
                });
            }
        }
    });


}

exports.persistTestRunByIdFromEvents = function (req, res) {

    Event.find({ $and: [ { productName: req.params.productName }, { dashboardName: req.params.dashboardName },{ testRunId: req.params.testRunId }  ] }).sort('-end').exec(function(err, events) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            createTestrunFromEvents(req.params.productName, req.params.dashboardName,events, function(testrunFromEvents){

                benchmarkAndPersistTestRunById(req.params.productName, req.params.dashboardName,testrunFromEvents[0] , function (persistedTestrun) {

                    res.jsonp(persistedTestrun);

                });

            });
        }
    });
}



exports.getTestRunById = function (productName, dashboardName, testRunId, callback) {

    Testrun.findOne({ $and: [
        { productName: productName },
        { dashboardName: dashboardName },
        { testRunId: testRunId }
    ] }).sort('-end').exec(function (err, testRun) {

        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            if (testRun) {

                callback(testRun);

            } else {

                Event.find({ $and: [ { productName:productName }, { dashboardName: dashboardName },{ testRunId:testRunId }  ] }).sort('-end').exec(function(err, events) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {

                        if(events.length > 0) {

                            createTestrunFromEvents(productName, dashboardName,events, function(testrunFromEvents){

                                     getAndPersistTestRunById(productName, dashboardName, testrunFromEvents[0], function (persistedTestrun) {

                                        callback(persistedTestrun);

                                    });
                            });

                        }else{

                            callback(null);
                        }
                    }
                });

            }
        }

    });
}

function benchmarkAndPersistTestRunById (productName, dashboardName, testRun, callback){

    Testrun.findOne({testRunId: testRun.testRunId}).exec(function(err, savedTestrun) {

        if (err){
            console.log(err);
        }else{
            if(savedTestrun) {

                savedTestrun.remove(function (err) {

                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }else{

                        getDataForTestrun(productName, dashboardName, testRun, function (metrics) {

                            saveTestrun(testRun, metrics, function (savedTestrun) {

                                Requirements.setRequirementResultsForTestRun(savedTestrun, function (requirementsTestrun) {

                                    Benchmarks.setBenchmarkResultsPreviousBuildForTestRun(requirementsTestrun, function (benchmarkPreviousBuildTestrun) {

                                        Benchmarks.setBenchmarkResultsFixedBaselineForTestRun(benchmarkPreviousBuildTestrun, function (benchmarkFixedBaselineTestrun) {

                                            /* Save updated test run */
                                            Testrun.findById(benchmarkFixedBaselineTestrun._id, function(err, savedTestRun) {
                                                if(err) console.log(err)
                                                if (!savedTestRun)
                                                    console.log('Could not load Document');
                                                else {

                                                    savedTestRun = benchmarkFixedBaselineTestrun;

                                                    savedTestRun.save(function(err) {
                                                        if (err)
                                                            console.log('error')
                                                        else
                                                            callback(savedTestRun);
                                                    });
                                                }
                                            });

                                        });
                                    });

                                });
                            });

                        });


                    }

                });

            }else{

                getDataForTestrun(productName, dashboardName, testRun, function (metrics) {

                    saveTestrun(testRun, metrics, function (savedTestrun) {

                        Requirements.setRequirementResultsForTestRun(savedTestrun, function (requirementsTestrun) {

                            Benchmarks.setBenchmarkResultsPreviousBuildForTestRun(requirementsTestrun, function (benchmarkPreviousBuildTestrun) {

                                Benchmarks.setBenchmarkResultsFixedBaselineForTestRun(benchmarkPreviousBuildTestrun, function (benchmarkFixedBaselineTestrun) {

                                    /* Save updated test run */
                                    Testrun.findById(benchmarkFixedBaselineTestrun._id, function(err, savedTestRun) {
                                        if (err) console.log(err);
                                        if (!savedTestRun)
                                            console.log('Could not load Document');
                                        else {

                                            savedTestRun = benchmarkFixedBaselineTestrun;

                                            savedTestRun.save(function(err) {
                                                if (err) {
                                                    console.log('error')
                                                }else {
                                                    console.log('test run saved: ' + savedTestRun.testRunId);
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


};

function getAndPersistTestRunById (productName, dashboardName, testRun, callback){

    Testrun.findOne({testRunId: testRun.testRunId}).exec(function(err, savedTestrun) {

        if (err){
            console.log(err);
        }else{

            getDataForTestrun(productName, dashboardName, testRun, function (metrics) {

                saveTestrun(testRun, metrics, function (savedTestrun) {

                        console.log('test run saved: ' + savedTestrun.testRunId);
                        callback(savedTestrun);
                });

            });

        }

    });


};


function getDataForTestrun(productName, dashboardName, testRun, callback){



        Product.findOne({name: productName}).exec(function(err, product){
            if(err) console.log(err);

            Dashboard.findOne( { $and: [ { productId: product._id }, { name: dashboardName } ] } ).populate('metrics').exec(function(err, dashboard){

                if(err) console.log(err);
                var metrics = [];


                async.forEachLimit(dashboard.metrics, 16, function (metric, callback) {

                    var targets = [];

                    async.forEachLimit(metric.targets, 16, function (target, callback) {

                        graphite.getGraphiteData(Math.round(testRun.start / 1000), Math.round(testRun.end / 1000), target, 900, function(body){

                            _.each(body, function(target){

                                targets.push({
                                    target: target.target,
                                    value: calculateAverage(target.datapoints)
                                });

                            })
                            callback();
                        });

                    }, function (err) {
                        if (err) return next(err);

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
                        callback();

                    });
                }, function (err) {
                    if (err) return next(err);

                    callback(metrics);

                });

            });
        });

}

function calculateAverage(datapoints){
    var count = 0;
    var total = 0;

    _.each(datapoints, function(datapoint){

        if(datapoint != null){

            count++;
            total += datapoint[0];

        }

    })

    return Math.round((total / (count)) * 100)/100;
}

function saveTestrun(testrun, metrics, callback){

    getPreviousBuild(testrun.productName, testrun.dashboardName,testrun.testRunId, function(previousBuild){

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


        persistTestrun.save(function(err) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                callback(persistTestrun);
            }
        });

    });
}

function getPreviousBuild(productName, dashboardName, testrunId, callback){

    var previousBuild;

    Event.find({ $and: [ { productName: productName }, { dashboardName: dashboardName } ] }).sort('-eventTimestamp').exec(function(err, events) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {

            createTestrunFromEvents(productName, dashboardName, events, function(testruns){

                _.each(testruns, function (testrun, i) {

                    if (testrun.testRunId === testrunId) {
                        if(i+1 === testruns.length){

                            return null;

                        }else {
                            previousBuild = testruns[i + 1].testRunId;
                            return previousBuild;
                        }
                    }

                })

                callback(previousBuild);
            });
        }
    });
}

function setTestrunRequirementResults(metrics){

    var meetsRequirement = true;

    _.each(metrics, function(metric){

        if(metric.meetsRequirement === false) {

            meetsRequirement = false;
            return;
        }
    })

    return meetsRequirement;
}

function setMetricRequirementResults(targets){

    var meetsRequirement = true;

    _.each(targets, function(target){

        if(target.meetsRequirement === false) {

            meetsRequirement = false;
            return;
        }
    })

    return meetsRequirement;
}


function evaluateRequirement(value, requirementOperator, requirementValue){

    var requirementResult;

    if((requirementOperator === "<" && value > requirementValue) || requirementOperator === ">" && value < requirementValue){

        var requirementResult = false;

    }else{

        var requirementResult = true;
    }

    return requirementResult;
}

function createTestrunFromEvents(productName, dashboardName, events, callback) {

    var testRuns = [];

    Product.findOne({name: productName}).exec(function(err, product){
        if(err) console.log(err);

        Dashboard.findOne( { $and: [ { productId: product._id }, { name: dashboardName } ] } ).exec(function(err, dashboard) {

            if (err) {
                console.log(err);
            } else {


                for (var i = 0; i < events.length; i++) {

                    if (events[i].eventDescription === 'start') {

                        for (var j = 0; j < events.length; j++) {

                            if (events[j].eventDescription === 'end' && events[j].testRunId == events[i].testRunId) {

                                if (events[i].buildResultKey) {

                                    testRuns.push({start: events[i].eventTimestamp, startEpoch: events[i].eventTimestamp.getTime(), end: events[j].eventTimestamp, endEpoch: events[j].eventTimestamp.getTime(), productName: events[i].productName, dashboardName: events[i].dashboardName, testRunId: events[i].testRunId, buildResultKey: events[i].buildResultKey, eventIds: [events[i].id, events[j].id], meetsRequirement: null, benchmarkResultFixedOK: null, benchmarkResultPreviousOK: null, baseline: dashboard.baseline || events[i].baseline});
                                } else {

                                    testRuns.push({start: events[i].eventTimestamp, startEpoch: events[i].eventTimestamp.getTime(), end: events[j].eventTimestamp, endEpoch: events[j].eventTimestamp.getTime(), productName: events[i].productName, dashboardName: events[i].dashboardName, testRunId: events[i].testRunId, eventIds: [events[i].id, events[j].id], meetsRequirement: null, benchmarkResultFixedOK: null, benchmarkResultPreviousOK: null, baseline: dashboard.baseline || events[i].baseline});
                                }

                                break;
                            }

                        }
                    }
                }

                callback(testRuns);
            }
        });
    });
}

/**
 * Show the current Testrun
 */
exports.runningTest = function (req, res){

    var currentTime = new Date();
    var anyEventFound = false;

    Event.find({ $and: [ { productName: req.params.productName }, { dashboardName: req.params.dashboardName } ] }).sort({eventTimestamp: -1}).lean().exec(function(err, events){

        if(err) throw err;

        for(var i=0;i<events.length;i++) {

            if (events[i].eventDescription === 'start') {

                var endEventFound = false;
                var tooOld = false;
                var anyEventFound = true;

                for (var j = 0; j < events.length; j++) {

                    if (events[i].testRunId == events[j].testRunId && events[j].eventDescription === 'end')
                        endEventFound = true;

                }


                if (endEventFound == false && (currentTime.getTime() - events[i].eventTimestamp.getTime()  < 176400000)) {

                    var returnEvent = events[i];

                    res.jsonp(returnEvent);

                    break;

                /* If running test is older than 48 hours, leave it*/
                } else if( (currentTime.getTime() - events[i].eventTimestamp.getTime()) > 176400000){
                    tooOld = true
                }


            }
        }

        if (endEventFound === true || tooOld === true || anyEventFound === false ) {
            res.jsonp({});

        }


    });

}
/**
 * Update a Testrun
 */
function updateTestRunRequirementForMetric(metric) {

    Testrun.find( { $and: [ { productName: metric.productName }, { dashboardName: metric.dashboardName } ] } ).exec(function(err, testruns) {

        _.each(testruns, function(testrun){


            var metricToUpdate = testrun.metrics.id(metric._id);

            metricToUpdate.requirementOperator = metric.requirementOperator;
            metricToUpdate.requirementValue = metric.requirementValue;

            metricToUpdate.targets = setTargetRequirementResults( metricToUpdate.targets, metricToUpdate.requirementOperator, metricToUpdate.requirementValue );
            metricToUpdate.meetsRequirement = setMetricRequirementResults(metricToUpdate.targets)

            testrun.meetsRequirement = setTestrunRequirementResults(testrun.metrics);

            testrun.save(function(err){
                if (err) console.log("bla: " + err.stack);
            })

        })
    })


};





function updateTestRunMetric(testrun, metric){


    var updatedMetric;

    updatedMetric.requirementOperator = metric.requirementOperator;
    updatedMetric.requirementValue = metric.requirementValue;


    //var updatedMetrics = [];
    //
    //
    //_.each(testrun.metrics, function(testrunMetric){
    //
    //    if (testrunMetric._id.toString() === updatedMetric._id){
    //
    //        /* update requirement values */
    //        testrunMetric.requirementOperator = updatedMetric.requirementOperator;
    //        testrunMetric.requirementValue = updatedMetric.requirementValue;
    //
    //        updatedMetrics.push(setMetricRequirementResults(testrunMetric));
    //
    //    }else{
    //
    //        updatedMetrics.push(updatedMetric);
    //    }
    //
    //
    //})
    //
    //return updatedMetrics;

}

function getTargets(metrics, metricId){

   var targets = [];

    _.each(metrics, function(metric){

        if (metric._id === metricId){

            _.each(metric.targets, function(target){

                targets.push(target);
            })

            return targets;
        }

    })

    return targets;

}
/**
 * Delete an Testrun
 */
exports.delete = function(req, res) {

};

/**
 * List of Testruns
 */
exports.list = function(req, res) {

};
