'use strict';
module.exports = function (app) {
  var updateTestRuns = require('../../app/controllers/update-testruns.server.controller');

  app.route('/update-testruns').get(updateTestRuns.updateTestRuns);

};
