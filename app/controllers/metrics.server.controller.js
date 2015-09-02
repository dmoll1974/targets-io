'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Metric = mongoose.model('Metric'),
	testruns = require('./testruns.server.controller'),
	_ = require('lodash');

/**
 * Create a Metric
 */
exports.create = function(req, res) {
	var metric = new Metric(req.body);
	metric.user = req.user;

	metric.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(metric);
		}
	});
};

/**
 * Show the current Metric
 */
exports.read = function(req, res) {
	res.jsonp(req.metric);
};

/**
 * Update a Metric
 */
exports.update = function(req, res) {
	var metric = req.metric ;

	/* update testruns if requirements have changed */

	if (req.metric.requirementValue !== req.body.requirementValue || req.metric.requirementOperator !== req.body.requirementOperator){

		testruns.updateTestRunRequirementForMetric(req.body)
	}

	metric = _.extend(metric , req.body);

	metric.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(metric);
		}
	});
};

/**
 * Delete an Metric
 */
exports.delete = function(req, res) {
	var metric = req.metric ;

	metric.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(metric);
		}
	});
};

/**
 * List of Metrics
 */
exports.list = function(req, res) { 
	Metric.find().sort('-created').populate('user', 'displayName').exec(function(err, metrics) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(metrics);
		}
	});
};

/**
 * Metric middleware
 */
exports.metricByID = function(req, res, next, id) { 
	Metric.findById(id).populate('user', 'displayName').exec(function(err, metric) {
		if (err) return next(err);
		if (! metric) return next(new Error('Failed to load Metric ' + id));
		req.metric = metric ;
		next();
	});
};

/**
 * Metric authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.metric.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
