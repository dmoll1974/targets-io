 'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema,
    Dashboard = mongoose.model('Dashboard'),

    config = require('../../config/config');
/**
 * Product Schema
 */
var ProductSchema = new mongoose.Schema({
  'name': {
    type: String,
    uppercase: true
  },
  'description': String,
   'markDown': {
        type: String,
        default: ''
    },
    'triggerTestRunsWithJenkins': {
            type: Boolean,
            default: false
        },
    'jenkinsJobName': String,
    'graylogFacility': String,
   'dashboards': [{
      type: Schema.Types.ObjectId,
      ref: 'Dashboard'
    }],
  'requirements': [ {
      'stakeholder': String,
      'description': String,
      'relatedDashboards': [ String ],
      'result':{
          type: Boolean,
          default: false
      }
  } ]
},
    {
        read: 'primary',
        safe: {w: 'majority', j: true, wtimeout: 5000} // 2 replicas and 5 seconds timeout from replica
    });

 ProductSchema.pre('remove', function(next) {
     // 'this' is the client being removed. Provide callbacks here if you want
     // to be notified of the calls' result.
     Dashboard.remove({productId: this._id}).exec();
     next();
 });

ProductSchema.index({ name: 1 }, { unique: true });
mongoose.model('Product', ProductSchema);
