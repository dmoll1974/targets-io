'use strict';
module.exports = function (app) {
  var jenkins = require('../../app/controllers/jenkins.server.controller');
  // Events Routes
  app.route('/jenkins-stdout').post(jenkins.getConsoleData);
  app.route('/jenkins-jobs/:productName').get(jenkins.getJenkinsJobs);
};
