'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    winston = require('winston'),
    errorHandler = require('./errors.server.controller'),
    Product = mongoose.model('Product'),
    _ = require('lodash');

exports.create = create;
exports.read = read;
exports.update = update;
exports.delete = deleteFn;
exports.list = list;
exports.productByName = productByName;
exports.productById = productById;


    /**
 * Create a Product
 */
function create(req, res) {
  var product = new Product(req.body);
  product.user = req.user;
  product.save(function (err) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(product);
    }
  });
};
/**
 * Show the current Product
 */
function read(req, res) {
  res.jsonp(req.product);
};
/**
 * Update a Product
 */
function update(req, res) {
  var product = req.product;
  //product = _.extend(product , req.body);
  product.name = req.body.name;
  product.description = req.body.description;
  product.markDown = req.body.markDown;
  product.requirements = req.body.requirements;
  product.triggerTestRunsWithJenkins = req.body.triggerTestRunsWithJenkins;
  product.jenkinsJobName = req.body.jenkinsJobName;

  product.save(function (err) {
    if (err) {
      winston.error(err);
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(product);
    }
  });
};
/**
 * Delete an Product
 */
function deleteFn(req, res) {
  var product = req.product;
  product.remove(function (err) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(product);
    }
  });
};
/**
 * List of Products
 */
function list(req, res) {
  Product.find().sort('name').populate({
    path: 'dashboards',
    options: { sort: { name: 1 } }
  }).exec(function (err, products) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(products);
    }
  });
};
/**
 * Product middleware
 */
function productByName(req, res, next, name) {
  Product.findOne({ name: name.toUpperCase() }).populate('user', 'displayName').populate('dashboards').exec(function (err, product) {
    if (err)
      return next(err);
    if (!product)
      return res.status(404).send({ message: 'No product with name' + name + 'has been found' });
    req.product = product;
    next();
  });
};
function productById(req, res, next, id) {
  Product.findById(id).exec(function (err, product) {
    if (err)
      return next(err);
    if (!product)
      return next(new Error('Failed to load Product ' + id));
    req.product = product;
    next();
  });
};
/**
 * Product authorization middleware
 */
//exports.hasAuthorization = function (req, res, next) {
//  if (req.product.user.id !== req.user.id) {
//    return res.status(403).send('User is not authorized');
//  }
//  next();
//};
