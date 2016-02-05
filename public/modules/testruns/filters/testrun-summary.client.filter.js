'use strict';
angular.module('testruns').filter('testRunSummary', ['Utils', function (Utils) {
  return function(metrics) {
    var filtered = [];
    _.each(metrics, function(metric){

      if (metric.includeInSummary === true) filtered.push(metric);

    });

    return filtered.sort(Utils.dynamicSort('summaryIndex'));
  };
  }]);
