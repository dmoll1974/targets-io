'use strict';
module.exports = function (app) {
  var healthCheck = require('../../app/controllers/health-check.server.controller');

  // Health check route
  app.route('/health-check').get(healthCheck.healthCheck);

};
