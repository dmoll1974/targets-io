'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), errorHandler = require('./errors.server.controller'), Dashboard = db.model('Dashboard'), Product = db.model('Product'), Metric = db.model('Metric'), _ = require('lodash');
exports.clone = function (req, res) {
  var dashboardClone = new Dashboard();
  var metricCloneArray = [];
  _.each(req.dashboard.metrics, function (metric) {
    var metricClone = new Metric();
    metricClone.dashboardId = dashboardClone._id;
    metricClone.alias = metric.alias;
    metricClone.targets = metric.targets;
    metricClone.benchmarkOperator = metric.benchmarkOperator;
    metricClone.benchmarkValue = metric.benchmarkValue;
    metricClone.requirementValue = metric.requirementValue;
    metricClone.requirementOperator = metric.requirementOperator;
    metricClone.tags = metric.tags;
    metricCloneArray.push(metricClone._id);
    metricClone.save(function (err) {
      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      }
    });
  });
  dashboardClone.name = req.dashboard.name + '-CLONE';
  dashboardClone.metrics = metricCloneArray;
  dashboardClone.productId = req.dashboard.productId;
  dashboardClone.save(function (err) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(dashboardClone);
    }
  });
};
/**
 * Create a Dashboard
 */
exports.create = function (req, res) {
  var dashboard = new Dashboard(req.body);
  dashboard.user = req.user;
  dashboard.productId = req.product._id;
  dashboard.save(function (err) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(dashboard);
    }
  });
};
/**
 * Update a Dashboard
 */
exports.update = function (req, res) {
  var dashboard = req.dashboard;
  dashboard.name = req.body.name;
  dashboard.description = req.body.description;
  dashboard.goal = req.body.goal;
  dashboard.tags = req.body.tags;
  dashboard.baseline = req.body.baseline;
  dashboard.useInBenchmark = req.body.useInBenchmark;
  dashboard.includeRampUp = req.body.includeRampUp;
  dashboard.startSteadyState = req.body.startSteadyState;
  dashboard.save(function (err) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(dashboard);
    }
  });
};
/**
 * Delete an Dashboard
 */
exports.delete = function (req, res) {
  var dashboard = req.dashboard;
  dashboard.remove(function (err) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(dashboard);
    }
  });
};
/**
 * List of Dashboards
 */
exports.list = function (req, res) {
  Dashboard.find().sort('-created').populate('metrics').exec(function (err, dashboards) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(dashboards);
    }
  });
};
/**
 * Show the current Dashboard
 */
exports.read = function (req, res) {
  Dashboard.findOne({
    productId: req.product._id,
    name: req.params.dashboardName.toUpperCase()
  }).populate({
    path: 'metrics',
    options: {
      sort: {
        tag: 1,
        alias: 1
      }
    }
  }).exec(function (err, dashboard) {
    if (err)
      return next(err);
    if (!dashboard)
      return res.status(404).send({ message: 'No dashboard with name' + req.params.dashboardName + 'has been found' });
    res.jsonp(dashboard);
  });
};
/**
 * Dashboard middleware
 */
exports.dashboardByID = function (req, res, next, id) {
  Dashboard.findById(id).populate({
    path: 'metrics',
    options: {
      sort: {
        tag: 1,
        alias: 1
      }
    }
  }).exec(function (err, dashboard) {
    if (err)
      return next(err);
    if (!dashboard)
      return next(new Error('Failed to load Dashboard ' + id));
    req.dashboard = dashboard;
    next();
  });
};
exports.dashboardByProductName = function (req, res, next, productName) {
  Product.findOne({ name: productName.toUpperCase() }).exec(function (err, product) {
    if (err)
      return next(err);
    if (!product)
      return res.status(404).send({ message: 'No product with name' + productName + 'has been found' });
    req.product = product;
    next();
  });
};
/**
 * Dashboard authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
  if (req.dashboard.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};
