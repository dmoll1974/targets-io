'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Product = mongoose.model('Product'),
    Template = mongoose.model('Template'),
    _ = require('lodash');
