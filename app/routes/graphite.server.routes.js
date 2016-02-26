'use strict';
module.exports = function (app) {
  var graphite = require('../../app/controllers/graphite.server.controller');
  // Events Routes
  app.route('/graphite').get(graphite.getData);
  app.route('/flush-graphite-cache').get(graphite.flushGraphiteCache);
  app.route('/graphite/find/:query').get(graphite.findMetrics);
  };
