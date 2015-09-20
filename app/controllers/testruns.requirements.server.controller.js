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


exports.setRequirementResultsForTestRun = setRequirementResultsForTestRun;


function setRequirementResultsForTestRun(testRun, callback){

    var requirementsSet = false;
    var updatedMetrics = [];

    _.each(testRun.metrics, function(metric, i){

        /* if requirement is set for metric, check requirements*/
        if(metric.requirementValue) {
            requirementsSet = true;
            metric.targets = setTargetRequirementResults(metric.targets, metric.requirementOperator, metric.requirementValue);
            metric.meetsRequirement = setMetricRequirementResults(metric.targets);
        }

        updatedMetrics.push({
            _id: metric._id,
            tags: metric.tags,
            alias: metric.alias,
            type: metric.type,
            meetsRequirement: metric.meetsRequirement,
            requirementOperator: metric.requirementOperator,
            requirementValue: metric.requirementValue,
            benchmarkOperator: metric.benchmarkOperator,
            benchmarkValue: metric.benchmarkValue,
            targets:metric.targets
        });


    })

    testRun.metrics = updatedMetrics;

    if(requirementsSet)
        testRun.meetsRequirement = setTestrunRequirementResults(testRun.metrics)
    else
        testRun.meetsRequirement = null;


    callback(testRun);

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




function setTargetRequirementResults(targets,requirementOperator, requirementValue){

    var updatedTargets = [];

    _.each(targets, function(target){

        var meetsRequirement = evaluateRequirement(target.value, requirementOperator, requirementValue);

        updatedTargets.push({
            meetsRequirement: meetsRequirement,
            target: target.target,
            value: target.value,
            _id: target._id
        });

    })

    return updatedTargets;
}



