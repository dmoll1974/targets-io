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

exports.list = list;
exports.create = create;
exports.update = update;
exports.templateByID = templateByID;
exports.getTemplateByName = getTemplateByName;
exports.templateByName = templateByName;
exports.delete = deleteTemplate;

/**
 * Delete a Template
 */
function deleteTemplate(req, res) {
    var template = req.template;
    template.remove(function (err) {
        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else {
            res.jsonp(template);
        }
    });
};

/**
 * Get Template by name
 */

function getTemplateByName(req, res) {

    res.jsonp(req.template);

};

/**
 * List Templates
 */

function list(req, res){

    Template.find().sort('name').exec(function(err, templates){

        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else {
            res.jsonp(templates);
        }
    });
};

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

    if (req.body.metrics){

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
                return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
            } else {
                res.jsonp(savedTemplate);
            }
        });
    }else{

        template.save(function (err, savedTemplate) {
            if (err) {
                return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
            } else {
                res.jsonp(savedTemplate);
            }
        });
    }
}


/**
 * Template middleware
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

function templateByName(req, res, next, name) {
    Template.findOne({ name: name.toUpperCase()}).exec(function (err, template) {
        if (err)
            return next(err);
        if (!template)
            return res.status(404).send({ message: 'No template with name' + name + 'has been found' });
        req.template = template;
        next();
    });
};

