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
      getRecentTestruns: getRecentTestruns,
      update: update,
      addTestRun: addTestRun,
      getTestRunById: getTestRunById,
      getRunningTest: getRunningTest,
      refreshTestrun: refreshTestrun,
      delete: deleteFn,
      updateFixedBaseline: updateFixedBaseline,
      updateTestruns: updateTestruns,
      updateAllTestRunsForProduct: updateAllTestRunsForProduct,
      updateAllTestRunsForDashboard: updateAllTestRunsForDashboard,
      calculateTotalDuration: calculateTotalDuration,
      calculateDuration: calculateDuration
    };
    return TestRuns;

    function addTestRun(testRun){
      return $http.post('/add-testrun', testRun);
    }
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
      return $http.get('/testrun/' + productName + '/' + dashboardName + '/' + testRunId);
    }

    function update(testRun){

      return $http.put('/testrun/', testRun);

    }
    function getRecentTestruns(){

      return $http.get('/recent-testruns');

    }
    function listTestRunsForDashboard(productName, dashboardName, limit, page) {
      return $http.get('/testruns-dashboard/' + productName + '/' + dashboardName + '/' + limit + '/' + page);
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


    function calculateTotalDuration(testRuns){

      var totalDuration = 0;

      _.each(testRuns, function(testRun){

        totalDuration += (new Date(testRun.end).getTime() - new Date(testRun.start).getTime());
      })


      return(humanReadbleDuration(totalDuration));
    }

    function calculateDuration (testRun){

      var duration = new Date().getTime() - new Date(testRun.start).getTime();

      return(humanReadbleDuration(duration));
    }
    function humanReadbleDuration(durationInMs){

      var date = new Date(durationInMs);
      var readableDate = '';
      if(date.getUTCDate()-1 > 0) readableDate += date.getUTCDate()-1 + " days, ";
      if(date.getUTCHours() > 0) readableDate += date.getUTCHours() + " hours, ";
      readableDate += date.getUTCMinutes() + " minutes";
      return readableDate;
    }
  }
]);
