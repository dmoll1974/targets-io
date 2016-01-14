'use strict';
module.exports = function (app) {
  var testruns = require('../../app/controllers/testruns.server.controller.js');
  var benchmarks = require('../../app/controllers/testruns.benchmarks.server.controller');
  var requirements = require('../../app/controllers/testruns.requirements.server.controller');

  app.route('/testruns-dashboard/:productName/:dashboardName/:limit/:page').get(testruns.testRunsForDashboard);
  app.route('/testruns-product/:productName').get(testruns.testRunsForProduct);
  app.route('/recent-testruns').get(testruns.recentTestRuns);
  app.route('/testrun').put(testruns.update);
  app.route('/add-testrun').post(testruns.addTestRun);


  app.route('/testrun/:productName/:dashboardName/:testRunId')
      .get(testruns.testRunById)
      .delete(testruns.deleteTestRunById);
  app.route('/refresh-testrun/:productName/:dashboardName/:testRunId').get(testruns.refreshTestrun);
  app.route('/update-testruns-results/:productName/:dashboardName/:metricId/:updateRequirements/:updateBenchmarks').get(testruns.updateTestrunsResults);
  app.route('/update-fixed-baseline-benchmark').post(benchmarks.updateFixedBaselineBenchmark);
  app.route('/update-all-dashboard-testruns/:oldProductName/:oldDashboardName/:newDashboardName').get(testruns.updateAllDashboardTestRuns);
  app.route('/update-all-product-testruns/:oldProductName/:newProductName').get(testruns.updateAllProductTestRuns);
};
