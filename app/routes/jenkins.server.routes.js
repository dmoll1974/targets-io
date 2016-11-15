'use strict';
module.exports = function (app) {
  var jenkins = require('../../app/controllers/jenkins.server.controller');
  // Events Routes
  app.route('/jenkins-stdout').post(jenkins.getConsoleData);
  app.route('/jenkins-jobs').get(jenkins.getJenkinsJobs);
  app.route('/get-jenkins-host').get(jenkins.getJenkinsHost);
  app.route('/jenkins-login/:productName').get(jenkins.login);
  app.route('/jenkins-job-status/:productName/:jenkinsJobName').get(jenkins.getJenkinsJobStatus);
  app.route('/jenkins-start-job/:productName/:jenkinsJobName').get(jenkins.startJob);
  app.route('/jenkins-stop-job/:productName/:jenkinsJobName').get(jenkins.stopJob);
};
