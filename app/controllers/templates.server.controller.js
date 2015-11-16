'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Metric = mongoose.model('Metric'),
    Product = mongoose.model('Product'),
    Template = mongoose.model('Template'),
    _ = require('lodash'),
    async = require('async');


exports.create = create;
exports.update = update;
exports.templateByID = templateByID;

/**
 * Update a Template
 */

function update(req, res){


    var template = req.template;

    template = _.extend(template, req.body);
    template.save(function (err) {
        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else {
            res.jsonp(template);
        }
    });

};

function create(req, res){

    var metricClone ={};
    var clonedMetrics=[];
    var template = new Template();

    template.name = req.body.name;
    template.description = req.body.description;

    /* if template is created from existing dashboard, clone metrics */

    if (req.body.metrics.length > 0){

        _.each(req.body.metrics, function(metric){

            metricClone.alias = metric.alias;
            metricClone.targets = metric.targets;
            metricClone.tags = metric.tags;
            metricClone.benchmarkValue = metric.benchmarkValue;
            metricClone.benchmarkOperator = metric.benchmarkOperator;
            metricClone.requirementValue = metric.requirementValue;
            metricClone.requirementOperator = metric.requirementOperator;

            template.metrics .push(metricClone);


        });


        template.save(function (err, savedTemplate) {
            if (err) {
                console.log(err);
            } else {

                res.jsonp(savedTemplate);
            }
        });
    }
}


/**
 * Metric middleware
 */
function templateByID(req, res, next, id) {
    Template.findById(id).exec(function (err, template) {
        if (err)
            return next(err);
        if (!template)
            return next(new Error('Failed to load template ' + id));
        req.template = template;
        next();
    });
};
