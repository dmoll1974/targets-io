'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gatlingDetailsSchema = new mongoose.Schema({
  "consoleUrl": String,
  "response": Object
});

gatlingDetailsSchema.index({ consoleUrl: 1}, { unique: true });

gatlingDetailsSchema.on('index', function(err) {
  if (err) {
    console.error('User index error: %s', err);
  } else {
    console.info('User indexing complete');
  }
});

db.model('GatlingDetails', gatlingDetailsSchema);
