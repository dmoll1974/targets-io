'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema, config = require('../../config/config');

/**
 * Release Schema
 */
var ReleaseSchema = new Schema({
  'name': {
    type: String,
    uppercase: true
  },
  'productRelease': {
    type: String,
    uppercase: true
  },
  'date': Date,
  'releaseTestRuns':[
    {
      productName: String,
      dashboardName: String,
      testRunId: String,
      end: Date, // hack this to sort the index in the release details page
      requirements: [
        {
          stakeholder: String,
          description: String,
          result: Boolean
        }
      ]
    }
  ],
  releaseLinks :[
    {
      description: String,
      url: String,
      linkText: String,
      openInNewTab: {
        type: Boolean,
        default: true
      }
    }
  ],
  'requirements': [{
    stakeholder : String,
    description : String,
    result : Boolean,

    relatedTestRuns: [ {
      productName: String,
      dashboardName: String,
      testRunId: String

    } ]
  }]
});

ReleaseSchema.index({
  productName: 1,
  productRelease: 1
 }, { unique: true });
db.model('Release', ReleaseSchema);
