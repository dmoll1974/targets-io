'use strict';

module.exports = function(app) {

    var testruns = require('../../app/controllers/testruns.server.controller.js');
    var benchmarks = require('../../app/controllers/testruns.benchmarks.server.controller');

    app.route('/testruns-dashboard/:productName/:dashboardName')
        .get(testruns.testRunsForDashboard);

    app.route('/testrun/:productName/:dashboardName/:testRunId')
        .get(testruns.testRunById)
        .delete(testruns.deleteTestRunById);

    app.route('/refresh-testrun/:productName/:dashboardName/:testRunId')
        .get(testruns.refreshTestrun);



    app.route('/running-test/:productName/:dashboardName')
        .get(testruns.runningTest);

    app.route('/update-fixed-baseline-benchmark')
        .post(benchmarks.updateFixedBaselineBenchmark);
};
