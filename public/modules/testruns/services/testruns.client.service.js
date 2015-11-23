'use strict';
//Events service used to communicate Events REST endpoints
angular.module('events').factory('TestRuns', [
  '$http',
  'Products',
  'Dashboards',
  'Events',
  function ($http, Products, Dashboards, Events) {
    var TestRuns = {
      //            'get' : getFn,
      list: [],
      selected: {},
      listTestRunsForDashboard: listTestRunsForDashboard,
      listTestRunsForProduct: listTestRunsForProduct,
      zoomFrom: '',
      zoomUntil: '',
      zoomRange: '',
      getTestRunById: getTestRunById,
      getRunningTest: getRunningTest,
      refreshTestrun: refreshTestrun,
      delete: deleteFn,
      updateFixedBaseline: updateFixedBaseline,
      updateTestruns: updateTestruns,
      updateAllTestRunsForProduct: updateAllTestRunsForProduct,
      updateAllTestRunsForDashboard: updateAllTestRunsForDashboard
    };
    return TestRuns;
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
                                                                                            //    TestRuns.selected = testRun;
                                                                                            //
                                                                                            //});
    }

    function listTestRunsForDashboard(productName, dashboardName, useInBenchmark) {
      return $http.get('/testruns-dashboard/' + productName + '/' + dashboardName + '/' + useInBenchmark);
    }
    listTestRunsForProduct
    function listTestRunsForProduct(productName) {
      return $http.get('/testruns-product/' + productName);
    }
    function refreshTestrun(productName, dashboardName, testRunId) {
      return $http.get('/refresh-testrun/' + productName + '/' + dashboardName + '/' + testRunId);
    }
    function deleteFn(productName, dashboardName, testRunId) {
      return $http.delete('/testrun/' + productName + '/' + dashboardName + '/' + testRunId);
    }

    function updateAllTestRunsForProduct(productName, newProductName){

      return $http.get('/update-all-product-testruns/' + productName + '/'  + newProductName  );
    }

    function updateAllTestRunsForDashboard(productName, dashboardName, newDashboardName){

      return $http.get('/update-all-dashboard-testruns/' + productName + '/' + dashboardName + '/' + newDashboardName + '/' );
    }
  }
]);
