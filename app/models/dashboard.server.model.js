'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Dashboard Schema
 */

var dashboardSchema = new mongoose.Schema({
    "productId": { type: Schema.Types.ObjectId, ref: "Product"},
    "name": { type: String, uppercase: true },
    "description": String,
    "metrics": [
        { type: Schema.Types.ObjectId, ref: "Metric"}
    ],
    "granularity": {type: Number, default: 15},
    "metricsRegexWily": [String],
    "hosts": [String],
    "applications": [String],
    "instances": Number,
    "tags": {type:[{text: String, default: Boolean}], default: [{text: 'Load', default: true},{text: 'JVM', default: false}, {text: 'DB', default: false}, {text:'CPU', default: false}, {text:'Frontend', default: false}, {text: 'JDBC', default: false}, {text: 'GC', default: false}, {text: 'Heap', default: false}, {text: 'Sessions', default: false}, {text: 'Threads', default: false}]}
});

dashboardSchema.pre('remove', function(next){
    this.model('Product').update(
        {_id: this.productId},
        {$pull: {dashboards: this._id}},
        {multi: true},
        next
    );
});

dashboardSchema.pre('save', function(next){
    this.model('Product').update(
        {_id: this.productId},
        {$addToSet: {dashboards: this._id}},
        next
    );
});

dashboardSchema.index({ name: 1, productId: 1}, { unique: true });

mongoose.model('Dashboard', dashboardSchema);
