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
    'testRunId': {
        type: String,
        uppercase: true
    },
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
    'productName': {
        type: String,
        uppercase: true
    },
    'productRelease': {
        type: String,
        uppercase: true
    },
    'dashboardName': {
        type: String,
        uppercase: true
    },
    'buildResultsUrl': String,
    'humanReadableDuration': String,
    'rampUpPeriod': Number



},
    {
        read: 'primary',
        safe: {w: 'majority', j: true, wtimeout: 5000} // 2 replicas and 5 seconds timeout from replica
    });

RunningTestSchema.index({
    testRunId: 1,
    productName: 1,
    dashboardName: 1

    }, { unique: true });


mongoose.model('RunningTest', RunningTestSchema);
