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
      //metricFilter: '',

      listTestRunsForDashboard: listTestRunsForDashboard,
      listRunningTestsForDashboard: listRunningTestsForDashboard,
      listTestRunsForProduct: listTestRunsForProduct,
      listTestRunsForProductRelease: listTestRunsForProductRelease,
      listProductReleasesFromTestRuns: listProductReleasesFromTestRuns,
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
      humanReadbleDuration: humanReadbleDuration,
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
    function getRecentTestruns(numberOfDays){

      return $http.get('/recent-testruns/' + numberOfDays);

    }
    function listTestRunsForDashboard(productName, dashboardName, limit) {
      return $http.get('/testruns-dashboard/' + productName + '/' + dashboardName + '/' + limit );
    }

    function listRunningTestsForDashboard(productName, dashboardName, limit) {
      return $http.get('/running-tests-dashboard/' + productName + '/' + dashboardName);
    }

    function listTestRunsForProduct(productName, limit) {
      return $http.get('/testruns-product/' + productName + '/' + limit);
    }

    function listProductReleasesFromTestRuns(productName) {
      return $http.get('/product-releases/' + productName );
    }

    function listTestRunsForProductRelease(productName, productRelease) {
      return $http.get('/testruns-product-release/' + productName + '/' + productRelease);
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


    function humanReadbleDuration(durationInMs){

      var date = new Date(durationInMs);
      var readableDate = '';
      var daysLabel = (date.getUTCDate()-1 === 1) ? " day, " : " days, ";
      var hoursLabel = (date.getUTCHours() === 1) ? " hour, " : " hours, "
      var minutesLabel = (date.getUTCMinutes() === 1) ? " minute" : " minutes";
      var secondsLabel = (date.getUTCSeconds() === 1) ? "  second" : "  seconds";

      if(date.getUTCDate()-1 > 0) readableDate += date.getUTCDate()-1 + daysLabel;
      if(date.getUTCHours() > 0) readableDate += date.getUTCHours() + hoursLabel ;
      if(date.getUTCMinutes() > 0)readableDate += date.getUTCMinutes() + minutesLabel ;
      if(date.getUTCMinutes() === 0)readableDate += date.getUTCSeconds() + secondsLabel ;
      return readableDate;
    }
  }
]);
