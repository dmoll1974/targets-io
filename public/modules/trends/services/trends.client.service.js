'use strict';
angular.module('trends').factory('Trends', [
  '$http',
  '$q',
  '$log',
  '$state',
  'Events',
  'Utils',
  function ($http, $q, $log, $state, Events, Utils) {
    var Trends = {
      getData: getData,
      getDataForMetric: getDataForMetric,
      Selected:[]

    };

    return Trends;

    function getDataForMetric(metric){

      var metricIndex = Trends.selected.metrics.map(function(trendMetric){return trendMetric.alias;}).indexOf(metric.alias);
      return Trends.selected.metrics[metricIndex];

    }

    function getData(productName, dashboardName, startDate){

      return $http.get('/trends/' + productName + '/' + dashboardName + '/' + startDate);



    }


  }
]);
