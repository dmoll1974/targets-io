'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    winston = require('winston'),
    errorHandler = require('./errors.server.controller'),
    Metric = mongoose.model('Metric'),
    Dashboard = mongoose.model('Dashboard'),
    testruns = require('./testruns.server.controller.js'),
    _ = require('lodash');


exports.create = create;
exports.read = read;
exports.update = update;
exports.delete = deleteFn;
exports.list = list;
exports.metricByID = metricByID;

    /**
 * Create a Metric
 */
function create(req, res) {
  var metric = new Metric(req.body);
  metric.user = req.user;
  metric.lastUpdated = new Date().getTime();
  metric.save(function (err, savedMetric) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      /* update dashboard lastUpdated */

      Dashboard.update({_id: metric.dashboardId}
        , { lastUpdated: new Date().getTime() }, { multi: false },function(err, testRuns){
            if(err) winston.error(err);
      })
      res.jsonp(savedMetric);
    }
  });
};
/**
 * Show the current Metric
 */
function read(req, res) {
  res.jsonp(req.metric);
};
/**
 * Update a Metric
 */
function update(req, res) {
  var metric = req.metric;
  /* update testruns if requirements have changed */
  //	if (req.metric.requirementValue !== req.body.requirementValue || req.metric.requirementOperator !== req.body.requirementOperator){
  //
  //		testruns.updateTestRunRequirementForMetric(req.body)
  //	}
  metric = _.extend(metric, req.body);
  metric.lastUpdated = new Date().getTime();
  metric.save(function (err) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {

      /* update dashboard lastUpdated */

      Dashboard.update({_id: metric.dashboardId}
          , { lastUpdated: new Date().getTime() }, { multi: false },function(err, testRuns){
            if(err) winston.error(err);
      })

      res.jsonp(metric);


    }
  });
};
/**
 * Delete an Metric
 */
function deleteFn(req, res) {
  var metric = req.metric;
  metric.remove(function (err) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(metric);
    }
  });
};
/**
 * List of Metrics
 */
function list(req, res) {
  Metric.find().sort('-created').populate('user', 'displayName').exec(function (err, metrics) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(metrics);
    }
  });
};
/**
 * Metric middleware
 */
function metricByID(req, res, next, id) {
  Metric.findById(id).populate('user', 'displayName').exec(function (err, metric) {
    if (err)
      return next(err);
    if (!metric)
      return next(new Error('Failed to load Metric ' + id));
    req.metric = metric;
    next();
  });
};
/**
 * Metric authorization middleware
 */
//exports.hasAuthorization = function (req, res, next) {
//  if (req.metric.user.id !== req.user.id) {
//    return res.status(403).send('User is not authorized');
//  }
//  next();
//};
