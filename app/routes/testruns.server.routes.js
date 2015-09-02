'use strict';

module.exports = function(app) {

    var testruns = require('../../app/controllers/testruns.server.controller');

    app.route('/testruns-dashboard/:productName/:dashboardName')
        .get(testruns.testRunsForDashboard);

    app.route('/testrun/:productName/:dashboardName/:testRunId')
        .get(testruns.testRunById)
        .delete(testruns.deleteTestRunById);

    app.route('/persist-testrun/:productName/:dashboardName/:testRunId')
        .get(testruns.persistTestRunByIdFromEvents);



    app.route('/running-test/:productName/:dashboardName')
        .get(testruns.runningTest);
};
