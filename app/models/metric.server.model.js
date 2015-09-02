'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Metric Schema
 */
var metricSchema = new mongoose.Schema({
    "dashboardId": { type: Schema.Types.ObjectId, ref: "Dashboard"},
    "dashboardName": String,
    "productName": String,
    "alias": {type: String, default: null},
    "targets": [String],
    "benchmarkValue": {type: Number, default: null},
    "benchmarkOperator": {type: String, default: null},
    "requirementValue": {type: Number, default: null},
    "requirementOperator": {type: String, default: null},
    "tags": [{text: String}],
    "type": {type: String, default: 'Average'}
});

metricSchema.pre('remove', function(next){
    this.model('Dashboard').update(
        {_id: this.dashboardId},
        {$pull: {metrics: this._id}},
        {multi: true},
        next
    );
});

metricSchema.pre('save', function(next){
    this.model('Dashboard').update(
        {_id: this.dashboardId},
        {$addToSet: {metrics: this._id}},
        next
    );
});
mongoose.model('Metric', metricSchema);
