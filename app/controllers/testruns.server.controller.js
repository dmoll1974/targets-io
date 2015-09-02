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

                    res.jsonp(addTestrunsFromEvents(testRuns,createTestrunFromEvents(events)));

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
    //Event.find( { $and: [ { productName: req.params.productName }, { dashboardName: req.params.dashboardName } ] } ).sort('-eventTimestamp').exec(function(err, storedEvents) {
    //    if (err) {
    //        return res.status(400).send({
    //            message: errorHandler.getErrorMessage(err)
    //        });
    //    } else {
    //
    //        var events = [];
    //        for (var i=0;i<storedEvents.length;i++){
    //
    //            events.push({"id" : storedEvents[i].toObject()._id, "eventTimestamp" : storedEvents[i].toObject().eventTimestamp.getTime() , "baseline" : storedEvents[i].toObject().baseline, "eventDescription" : storedEvents[i].toObject().eventDescription, "testRunId" : storedEvents[i].toObject().testRunId, "productName" : storedEvents[i].toObject().productName, "dashboardName" : storedEvents[i].toObject().dashboardName, "buildResultKey" : storedEvents[i].toObject().buildResultKey});
    //
    //        }
    //
    //        var testRuns = createTestrunFromEvents(events);
    //
    //        /* persist test runs */
    //        var persistedTestrunsPending = [];
    //        var persistedTestruns = [];
    //        var pendingStatus = false;
    //        var testRunsPendingResponse = {};
    //
    //
    //
    //        async.forEachLimit(testRuns, 30, function (testRun, callback) {
    //
    //            getAndPersistTestRunById(req.params.productName, req.params.dashboardName, testRun, req.params.pending, function(result){
    //
    //                persistedTestrunsPending.push(result);
    //                callback();
    //
    //
    //            });
    //        }, function (err) {
    //        if (err) return next(err);
    //
    //            _.each(persistedTestrunsPending, function(testRunPending){
    //
    //                persistedTestruns.push(testRunPending.testRun);
    //                if (testRunPending.persisted === false)  pendingStatus = true;
    //
    //            })
    //
    //        testRunsPendingResponse.testRuns = persistedTestruns.sort(utils.dynamicSort('-start'));
    //        testRunsPendingResponse.pending  = pendingStatus;
    //        res.jsonp(testRunsPendingResponse);
    //
    //    });
    //
    //
    //    }
    //
    //});
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

                        res.jsonp(createTestrunFromEvents(events)[0]);
                    }
                });
            }
        }
    });
    //getAndPersistTestRunById(req.params.productName, req.params.dashboardName, req.params.testRunId, false, function(result){
    //
    //    res.jsonp(result.testRun);
    //});

}

exports.persistTestRunByIdFromEvents = function (req, res) {

    Event.find({ $and: [ { productName: req.params.productName }, { dashboardName: req.params.dashboardName },{ testRunId: req.params.testRunId }  ] }).sort('-end').exec(function(err, events) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            getAndPersistTestRunById(req.params.productName, req.params.dashboardName, createTestrunFromEvents(events)[0], function (persistedTestrun) {

                res.jsonp(persistedTestrun);
            })
        }
    });
}



exports.persistTestRunById = function (productName, dashboardName, testRun, callback) {

    getAndPersistTestRunById (productName, dashboardName, testRun, function(persistedTestrun){

        callback(persistedTestrun);
    })
}


function  getAndPersistTestRunById (productName, dashboardName, testRun, callback){

    getDataForTestrun(productName, dashboardName, testRun.start, testRun.end, function (metrics) {

        saveTestrun(testRun, metrics, function (savedTestrun) {

            callback(savedTestrun);
        });

    });


    //var result = {};
    //var testRunUnPersisted = {};
    //
    //Testrun.findOne( { $and: [ { productName: productName }, { dashboardName: dashboardName }, { testRunId: testRun.testRunId } ] } ).exec(function(err, storedTestrun) {
    //
    //    if(storedTestrun){
    //
    //        result.persisted = true;
    //        result.testRun = storedTestrun.toObject();
    //        callback(result);
    //
    //    }else{
    //
    //        testRunUnPersisted.start = testRun.start;
    //        testRunUnPersisted.end = testRun.end;
    //        testRunUnPersisted.productName = testRun.productName;
    //        testRunUnPersisted.dashboardName = testRun.dashboardName;
    //        testRunUnPersisted.testRunId = testRun.testRunId;
    //        testRunUnPersisted.eventIds = testRun.eventIds;
    //
    //        result.persisted = false;
    //        result.testRun = testRunUnPersisted;
    //        callback(result);
    //
    //        /* if persisting was not yet initiated, get Graphite data and persist it */
    //        if (pending === false) {
    //            //Event.find({
    //            //    $and: [
    //            //        {productName: productName},
    //            //        {dashboardName: dashboardName},
    //            //        {testRunId: testRun.testRunId}
    //            //    ]
    //            //}).sort('-eventTimestamp').exec(function (err, storedEvents) {
    //            //    if (err) {
    //            //        return res.status(400).send({
    //            //            message: errorHandler.getErrorMessage(err)
    //            //        });
    //            //    } else {
    //            //
    //            //        var events = [];
    //            //        for (var i = 0; i < storedEvents.length; i++) {
    //            //
    //            //            events.push({
    //            //                "id": storedEvents[i].toObject()._id,
    //            //                "eventTimestamp": storedEvents[i].toObject().eventTimestamp.getTime(),
    //            //                "baseline": storedEvents[i].toObject().baseline,
    //            //                "eventDescription": storedEvents[i].toObject().eventDescription,
    //            //                "testRunId": storedEvents[i].toObject().testRunId,
    //            //                "productName": storedEvents[i].toObject().productName,
    //            //                "dashboardName": storedEvents[i].toObject().dashboardName,
    //            //                "buildResultKey": storedEvents[i].toObject().buildResultKey
    //            //            });
    //            //
    //            //        }
    //            //
    //            //        var testrun = createTestrunFromEvents(events);
    //
    //                    getDataForTestrun(productName, dashboardName, testrun[0].start, testrun[0].end, function (metrics) {
    //
    //                        saveTestrun(testrun[0], metrics, function (savedTestrun) {
    //
    //
    //                        });
    //
    //                    });
    //
    //                }
    //            });
    //        }
    //    }
    //});
};

function getDataForTestrun(productName, dashboardName, start, end, callback){

    Product.findOne({name: productName}).exec(function(err, product){
        if(err) console.log(err);

        Dashboard.findOne( { $and: [ { productId: product._id }, { name: dashboardName } ] } ).populate('metrics').exec(function(err, dashboard){

            if(err) console.log(err);
            var metrics = [];

            // _.each(dashboard.metrics, function(metric){

            async.forEachLimit(dashboard.metrics, 16, function (metric, callback) {

                var targets = [];

                async.forEachLimit(metric.targets, 16, function (target, callback) {

                    graphite.getGraphiteData(Math.round(start / 1000), Math.round(end / 1000), target, 900, function(body){

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

    var persistTestrun = new Testrun();

    persistTestrun.productName = testrun.productName;
    persistTestrun.dashboardName = testrun.dashboardName;
    persistTestrun.testRunId = testrun.testRunId;
    persistTestrun.start = testrun.start;
    persistTestrun.end = testrun.end;
    persistTestrun.baseline = testrun.baseline;
    persistTestrun.buildResultKey = testrun.buildResultKey;
    persistTestrun.eventIds = testrun.eventIds;


    _.each(metrics, function(metric, i){

        if(metric.requirementValue) {
            metric.targets = setTargetRequirementResults(metric.targets, metric.requirementOperator, metric.requirementValue);
            metric.metricMeetsRequirement = setMetricRequirementResults(metric.targets);
        }

        persistTestrun.metrics.push({
            _id: metric._id,
            tags: metric.tags,
            alias: metric.alias,
            type: metric.type,
            metricMeetsRequirement: metric.metricMeetsRequirement,
            requirementOperator: metric.requirementOperator,
            requirementValue: metric.requirementValue
        });

        _.each(metric.targets, function(target){

            persistTestrun.metrics[i].targets.push({
                targetMeetsRequirement: target.targetMeetsRequirement,
                target: target.target,
                value: target.value
            })
        })

    })

    persistTestrun.testrunMeetsRequirement = setTestrunRequirementResults(persistTestrun.metrics)
    persistTestrun.save(function(err) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            callback(persistTestrun);
        }
    });


}

function setTestrunRequirementResults(metrics){

    var testrunMeetsRequirement = true;

    _.each(metrics, function(metric){

        if(metric.metricMeetsRequirement === false) {

            testrunMeetsRequirement = false;
            return;
        }
    })

    return testrunMeetsRequirement;
}

function setMetricRequirementResults(targets){

    var metricMeetsRequirement = true;

    _.each(targets, function(target){

        if(target.targetMeetsRequirement === false) {

            metricMeetsRequirement = false;
            return;
        }
    })

    return metricMeetsRequirement;
}

//function setMetricRequirementResults(metric){
//
//
//    var updatedTargets = [];
//
//    var metricMeetsRequirement = true;
//
//    _.each(metric.targets, function (target) {
//
//        var targetMeetsRequirement = evaluateRequirement(target.value, metric.requirementOperator, metric.requirementValue);
//
//        updatedTargets.push({
//            targetMeetsRequirement: targetMeetsRequirement,
//            target: target.target,
//            value: target.value,
//            _id: target._id
//        });
//
//        if (targetMeetsRequirement === false) metricMeetsRequirement = false;
//
//    })
//
//    metric.targets = updatedTargets;
//    metric.metricMeetsRequirement = metricMeetsRequirement;
//
//
//    return metric;
//}

function evaluateRequirement(value, requirementOperator, requirementValue){

    var requirementResult;

    if((requirementOperator === "<" && value > requirementValue) || requirementOperator === ">" && value < requirementValue){

        var requirementResult = false;

    }else{

        var requirementResult = true;
    }

    return requirementResult;
}

function createTestrunFromEvents(events) {

    var testRuns = [];


    for (var i = 0; i < events.length; i++) {

        if (events[i].eventDescription === 'start') {

            for ( var j = 0; j < events.length; j++) {

                if (events[j].eventDescription  === 'end' && events[j].testRunId == events[i].testRunId ) {

                    if(events[i].buildResultKey) {

                        testRuns.push({start: events[i].eventTimestamp, startEpoch: events[i].eventTimestamp.getTime(), end: events[j].eventTimestamp, endEpoch: events[j].eventTimestamp.getTime(), productName: events[i].productName, dashboardName: events[i].dashboardName, testRunId: events[i].testRunId, buildResultKey: events[i].buildResultKey, eventIds: [events[i].id, events[j].id], testrunMeetsRequirement: null});
                    }else{

                        testRuns.push({start: events[i].eventTimestamp, startEpoch: events[i].eventTimestamp.getTime(), end: events[j].eventTimestamp, endEpoch: events[j].eventTimestamp.getTime(), productName: events[i].productName, dashboardName: events[i].dashboardName, testRunId: events[i].testRunId, eventIds: [events[i].id, events[j].id], testrunMeetsRequirement: null});
                    }

                    break;
                }

            }
        }
    }


    return testRuns;
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
            metricToUpdate.metricMeetsRequirement = setMetricRequirementResults(metricToUpdate.targets)

            testrun.testrunMeetsRequirement = setTestrunRequirementResults(testrun.metrics);

            testrun.save(function(err){
                if (err) console.log("bla: " + err.stack);
            })

        })
    })


};
function setTargetRequirementResults(targets,requirementOperator, requirementValue){

    var updatedTargets = [];

    _.each(targets, function(target){

        var targetMeetsRequirement = evaluateRequirement(target.value, requirementOperator, requirementValue);

        updatedTargets.push({
            targetMeetsRequirement: targetMeetsRequirement,
            target: target.target,
            value: target.value,
            _id: target._id
        });

    })

    return updatedTargets;
}


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
