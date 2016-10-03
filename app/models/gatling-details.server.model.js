'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gatlingDetailsSchema = new mongoose.Schema({
    'productName': {
        type: String,
        uppercase: true
    },
    'dashboardName': {
        type: String,
        uppercase: true
    },
    "consoleUrl": String,
    "response": Object
},
    {
      read: 'primary'
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
