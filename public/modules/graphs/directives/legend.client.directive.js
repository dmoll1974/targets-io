'use strict';

angular.module('graphs').directive('legend', LegendDirective);

function LegendDirective () {

  var directive = {

    restrict: 'E',
    //scope: {
    //  legend: '='
    //},
    templateUrl: 'modules/graphs/directives/legend.client.view.html',
    controller: LegendController,
    link: function(scope, elem, attrs) {

      scope.$watch('metric.legendData', function (newVal, oldVal) {
        if (newVal !== oldVal ) {
          scope.legendMetrics = scope.metric.legendData;
        }
      })
    }
  };

  return directive;

  /* @ngInject */
  function LegendController($scope, $rootScope, $timeout) {


      $scope.selectMetric = function(index) {

        _.each($scope.metric.legendData, function (legendItem, i) {

          if (i !== index)
            $scope.metric.legendData[i].visible = false

        });
      }
  }
}
