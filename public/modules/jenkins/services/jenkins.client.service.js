'use strict';
angular.module('jenkins').factory('Jenkins', [
  '$http',
  function ($http) {
    var Jenkins = {
      getData: getData,
      login: login,
      getJobStatus: getJobStatus,
      startJob: startJob,
      stopJob: stopJob,
      getJobs: getJobs
    };
    return Jenkins;


    function getData(consoleUrl, running, productName, dashboardName) {
      var postData = {
        productName: productName,
        dashboardName: dashboardName,
        consoleUrl: consoleUrl,
        running: running
      };
      return $http.post('/jenkins-stdout', postData);
    }

    function getJobs() {

      return $http.get('/jenkins-jobs');
    }

    function getJobStatus(productName, jenkinsJobName) {

      return $http.get('/jenkins-job-status/' + productName + '/' + jenkinsJobName);
    }

    function startJob(productName, jenkinsJobName) {

      return $http.get('/jenkins-start-job/' + productName + '/' + jenkinsJobName);
    }

    function stopJob(productName, jenkinsJobName) {

      return $http.get('/jenkins-stop-job/' + productName + '/' + jenkinsJobName);
    }

    function login(productName, jenkinsJobName) {

      return $http.get('/jenkins-login/' + productName );
    }
  }
]);
