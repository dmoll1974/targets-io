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
    'start': {
        type: Date,
        default: Date.now
    },
    'end': {
        type: Date
    },
    'keepAliveTimestamp': {
        type: Date,
        default: Date.now
    },
    'completed': {
        type: Boolean,
        default: false
    },
    'productName': String,
    'dashboardName': String,
    'buildResultKey': String

});

RunningTestSchema.index({
    testRunId: 1,
    productName: 1,
    dashboardName: 1

    }, { unique: true });


mongoose.model('RunningTest', RunningTestSchema);
