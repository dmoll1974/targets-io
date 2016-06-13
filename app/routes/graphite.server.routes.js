'use strict';
module.exports = function (app) {
  var graphite = require('../../app/controllers/graphite.server.controller');
  // Events Routes
  app.route('/graphite').get(graphite.getData);
  app.route('/flush-cache').post(graphite.flushCache);
  app.route('/graphite/find/:query').get(graphite.findMetrics);
  };
