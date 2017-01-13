'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Cluster Leader Schema
 */
var clusterLeaderSchema = new mongoose.Schema({
      'clusterId': {
        type: String,

      },
      'createdAt': {
          type: Date,
          expires: 20,
          default: Date.now }
    },
    {
      read: 'primary'
    }
);



mongoose.model('clusterLeader', clusterLeaderSchema);
