'use strict';

angular.module('graphs').directive('dygraph', DygraphDirective);

/* @ngInject */
function DygraphDirective ($timeout) {

  var directive = {

    restrict: 'E',
    scope: {
      metric: '='
     },
    //template: '<div flex class="dygraph-div"  style="width:100%;"><legend legend="legend" style="margin-top: 20px; margin-left: 30px;"></legend>',
    templateUrl: 'modules/graphs/directives/dygraph.client.view.html',
    controller: DygraphController,
    //
    link: function(scope, elem, attrs) {

      scope.$watch('loading', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal !== true) {
          var graph = new Dygraph(elem.children()[0], scope.data, scope.opts);
        }
      })

      scope.$watch('metric.legendData', function (newVal, oldVal) {
        if (newVal !== oldVal) {

          var graph = new Dygraph(elem.children()[0], scope.data, scope.opts);

          _.each(scope.metric.legendData, function(legendItem){
            graph.setVisibility(legendItem.id, legendItem.visible);
          })

        }
      })
    }
  };

  return directive;

  /* @ngInject */
  function DygraphController($scope, $stateParams, $rootScope, $timeout, TestRuns, Graphite) {

    TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
      TestRuns.selected = testRun;
      var from = TestRuns.zoomFrom ? TestRuns.zoomFrom : TestRuns.selected.startEpoch;
      var until = TestRuns.zoomUntil ? TestRuns.zoomUntil : TestRuns.selected.endEpoch;
      $scope.loading = true;
      updateGraph(from, until, $scope.metric.targets, function (dygraphData) {

        $scope.opts = {
          //axes: axes,
          labels: dygraphData.labels,
          //customBars: expectMinMax,
          //showRangeSelector: true,
          //interactionModel: Dygraph.Interaction.defaultModel,
          //clickCallback: $.proxy(this._onDyClickCallback, this),
          //connectSeparatedPoints: true,
          //dateWindow: [detailStartDateTm.getTime(), detailEndDateTm.getTime()],
          //drawCallback: $.proxy(this._onDyDrawCallback, this),
          //zoomCallback: $.proxy(this._onDyZoomCallback, this),
          //digitsAfterDecimal: 2,
          legend: 'never',
          includeZero: true,
          valueRange: [0,dygraphData.maxValue ],
          //yRangePad: 10,
          labelsDivWidth: "100%"//,
          //axes : {
          //  x : {
          //    valueFormatter: Dygraph.dateString_,
          //    ticker: Dygraph.dateTicker
          //    //xValueParser: function(x) { return parseInt(x); }
          //  }
          //},
          //xValueParser: function(x) { return parseInt(x); },

        };

        $scope.data = dygraphData.data;
        $scope.metric.legendData = dygraphData.legendData;
        $scope.loading = false;
      });
    });

    function updateGraph(from, until, targets, callback) {
      Graphite.getData(from, until, targets, 900).then(function (series) {
        if (series.length > 0) {
          Graphite.addEvents(series, from, until, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).then(function (seriesEvents) {
            callback(seriesEvents);
          });
        } else {
          callback(series);
        }
      });
    }

  };


}


