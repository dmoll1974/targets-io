'use strict';
angular.module('graphs').factory('Jenkins', [
  '$http',
  function ($http) {
    var Jenkins = {
      getData: getData,
      getJobs: getJobs
    };
    return Jenkins;


    function getData(consoleUrl, running) {
      var postData = {
        consoleUrl: consoleUrl,
        running: running
      };
      return $http.post('/jenkins-stdout', postData);
    }

    function getJobs(productName) {

      return $http.get('/jenkins-jobs/' + productName);
    }
  }
]);
