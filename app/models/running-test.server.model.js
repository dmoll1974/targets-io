'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../../config/config');

/**
 * Running test Schema
 */
var RunningTestSchema = new mongoose.Schema({
    'testRunId': String,
    'startTimestamp': {
        type: Date,
        default: Date.now
    },
    'keepAliveTimestamp': {
        type: Date,
        default: Date.now,
        expires: config.runningTestTimeout
    },
    'productName': String,
    'dashboardName': String

});

RunningTestSchema.index({
    testRunId: 1,
    productName: 1,
    dashboardName: 1

    }, { unique: true });


mongoose.model('RunningTest', RunningTestSchema);
