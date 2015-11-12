'use strict';
//Events service used to communicate Events REST endpoints
angular.module('events').factory('Templates', [
  '$http',

  function ($http) {
    var Templates = {
      list: [],
      selected: {},
      delete: deleteFn,
      update: update,
      create: create
    };
    return Templates;

    function updateTestruns(productName, dashboardName, metricId, updateRequirements, updateBenchmarks) {
      return $http.get('/update-testruns-results/' + productName + '/' + dashboardName + '/' + metricId + '/' + updateRequirements + '/' + updateBenchmarks);
    }
    function updateFixedBaseline(testRun) {
      return $http.post('/update-fixed-baseline-benchmark', testRun);
    }
    function getRunningTest(productName, dashboardName) {
      return $http.get('/running-test/' + productName + '/' + dashboardName);
    }
    function getTestRunById(productName, dashboardName, testRunId) {
      return $http.get('/testrun/' + productName + '/' + dashboardName + '/' + testRunId);  //.success(function(testRun){
                                                                                            //
                                                                                            //    Templates.selected = testRun;
                                                                                            //
                                                                                            //});
    }

    function listTemplatesForDashboard(productName, dashboardName, useInBenchmark) {
      return $http.get('/testruns-dashboard/' + productName + '/' + dashboardName + '/' + useInBenchmark);
    }
    listTemplatesForProduct
    function listTemplatesForProduct(productName) {
      return $http.get('/testruns-product/' + productName);
    }
    function refreshTestrun(productName, dashboardName, testRunId) {
      return $http.get('/refresh-testrun/' + productName + '/' + dashboardName + '/' + testRunId);
    }
    function deleteFn(productName, dashboardName, testRunId) {
      return $http.delete('/testrun/' + productName + '/' + dashboardName + '/' + testRunId);
    }
  }
]);
