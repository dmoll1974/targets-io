'use strict';
module.exports = function (app) {
  var jenkins = require('../../app/controllers/jenkins.server.controller');
  // Events Routes
  app.route('/jenkins-stdout').post(jenkins.getConsoleData);
  app.route('/jenkins-jobs/:productName').get(jenkins.getJenkinsJobs);
  app.route('/jenkins-job-status/:productName/:jenkinsJobName').get(jenkins.getJenkinsJobStatus);
  app.route('/jenkins-start-job/:productName/:jenkinsJobName').get(jenkins.startJob);
  app.route('/jenkins-stop-job/:productName/:jenkinsJobName').get(jenkins.stopJob);
};
