'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../../config/config');



var Mixed = Schema.Types.Mixed;

/**
 * Event Schema
 */
var graphiteCacheSchema = new mongoose.Schema({
  'key': {
    type: String,
  },
  'value': [
    {
    target: String,
    datapoints: [{ type: Mixed, default: []}]
    }
  ],
  'created': {
    type: Date,
    default: Date.now,
    expires: config.graphiteCacheTTL
  },
});
graphiteCacheSchema.index({
  key: 1
  }, { unique: true });



cacheDb.model('GraphiteCache', graphiteCacheSchema);
