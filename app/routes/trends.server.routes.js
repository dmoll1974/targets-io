'use strict';
module.exports = function (app) {
  var trends = require('../../app/controllers/trends.server.controller.js');

  app.route('/trends/:productName/:dashboardName/:startDate').get(trends.getData);

};
