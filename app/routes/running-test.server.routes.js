'use strict';
module.exports = function (app) {
  var runningTests = require('../../app/controllers/running-test.server.controller.js');

  app.route('/keep-alive/:product/:dashboard/:testRunId').get(runningTests.keepAlive);
  app.route('/get-running-tests').get(runningTests.getRunningTests);
  app.route('/running-test/:productName/:dashboardName').get(runningTests.runningTestForDashboard);


};
