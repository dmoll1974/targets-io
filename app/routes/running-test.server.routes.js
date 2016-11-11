'use strict';
module.exports = function (app) {
  var runningTests = require('../../app/controllers/running-test.server.controller.js');

  app.route('/running-test/:command').post(runningTests.runningTest);
  app.route('/update-running-test-annotations').post(runningTests.updateRunningTestAnnotations);
  app.route('/get-running-tests').get(runningTests.getRunningTests);
  app.route('/running-test/:productName/:dashboardName').get(runningTests.runningTestForDashboard);

  //app.route('/start-testrun').post(testruns.start);


};
