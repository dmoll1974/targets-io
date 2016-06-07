'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gatlingDetailsSchema = new mongoose.Schema({
  "consoleUrl": String,
  "response": Object
},
    {
      read: 'primary',
      safe: {w: 'majority', j: true, wtimeout: 5000} // 2 replicas and 5 seconds timeout from replica
    });

gatlingDetailsSchema.index({ consoleUrl: 1}, { unique: true });

gatlingDetailsSchema.on('index', function(err) {
  if (err) {
    console.error('User index error: %s', err);
  } else {
    console.info('User indexing complete');
  }
});

module.exports = mongoose.model('GatlingDetails', gatlingDetailsSchema);
