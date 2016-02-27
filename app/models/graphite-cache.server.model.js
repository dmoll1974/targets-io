'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../../config/config');


// Bootstrap cacheDb connection
 var cacheDb = mongoose.createConnection(config.cacheDb, function(err) {
  if (err) {
    console.error('Could not connect to cacheDb!');
    console.log(err);
  }
});

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
