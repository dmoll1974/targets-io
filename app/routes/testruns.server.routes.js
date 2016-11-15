'use strict';
module.exports = function (app) {
  var testruns = require('../../app/controllers/testruns.server.controller.js');
  var testrunSummary = require('../../app/controllers/testrun-summary.server.controller.js');
  var benchmarks = require('../../app/controllers/testruns.benchmarks.server.controller');
  var requirements = require('../../app/controllers/testruns.requirements.server.controller');

  app.route('/testruns-dashboard/:productName/:dashboardName/:limit').get(testruns.testRunsForDashboard);
  app.route('/running-tests-dashboard/:productName/:dashboardName').get(testruns.runningTestsForDashboard);
  app.route('/testruns-product/:productName/:limit').get(testruns.testRunsForProduct);
  app.route('/product-releases/:productName').get(testruns.productReleasesFromTestRuns);
  app.route('/update-product-release/:originalTestRunId').put(testruns.updateProductRelease)
  app.route('/testruns-product-release/:productName/:productRelease').get(testruns.testRunsForProductRelease);
  app.route('/recent-testruns/:numberOfDays').get(testruns.recentTestRuns);
  app.route('/testrun').put(testruns.update);
  app.route('/add-testrun').post(testruns.addTestRun);


  app.route('/testrun/:productName/:dashboardName/:testRunId')
      .get(testruns.testRunById)
      .delete(testruns.deleteTestRunById);
  app.route('/refresh-testrun/:productName/:dashboardName/:testRunId').get(testruns.refreshTestrun);
  app.route('/update-testruns-results/:productName/:dashboardName').get(testruns.updateTestrunsResults);
  app.route('/update-fixed-baseline-benchmark').post(benchmarks.updateFixedBaselineBenchmark);
  app.route('/update-all-dashboard-testruns/:oldProductName/:oldDashboardName/:newDashboardName').get(testruns.updateAllDashboardTestRuns);
  app.route('/update-all-product-testruns/:oldProductName/:newProductName').get(testruns.updateAllProductTestRuns);

  /* test run summary routes */

  app.route('/testrun-summary/:productName/:dashboardName/:testRunId').get(testrunSummary.get);
  app.route('/testrun-summary-release/:productName/:dashboardName/:testRunId').get(testrunSummary.getTestRunSummaryForRelease);
  app.route('/testrun-summary').post(testrunSummary.create);
  app.route('/testrun-summary').put(testrunSummary.update);
  app.route('/testrun-summary/:productName/:dashboardName/:testRunId').delete(testrunSummary.delete);

/* get benchmark results*/

  app.route('/benchmarks/:productName/:dashboardName/:testRunId').get(testruns.getTestRunBenchmarks);

};
