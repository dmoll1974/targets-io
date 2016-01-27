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
          scope.graph = new Dygraph(elem.children()[0], scope.data, scope.opts);

            var colors = scope.graph.getColors();

            _.each(scope.metric.legendData, function(legendItem, i){

              if(scope.metric.legendData[i].numberOfValidDatapoints > 0 ){

                scope.metric.legendData[i].color = colors[i];

              }

            })

        }
      })


    }
  };

  return directive;

  /* @ngInject */
  function DygraphController($scope, $stateParams, $rootScope, $timeout, TestRuns, Graphite) {

    $scope.selectAll = true;

    TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
      TestRuns.selected = testRun;
      var from = TestRuns.zoomFrom ? TestRuns.zoomFrom : TestRuns.selected.startEpoch;
      var until = TestRuns.zoomUntil ? TestRuns.zoomUntil : TestRuns.selected.endEpoch;
      $scope.loading = true;
      updateGraph(from, until, $scope.metric.targets, function (dygraphData) {

        $scope.opts = {
          //axes: axes,
          labels: dygraphData.labels,
          axisLabelFontSize : 12,
          //yLabelHeight: 12,
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
          highlightSeriesOpts: {
            strokeWidth: 2
          },
          highlightCallback: highLightLegend,
          unhighlightCallback: unHighLightLegend

          //yRangePad: 10,
          //labelsDivWidth: "100%"//,
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

    var unHighLightLegend = function(event){

      $scope.$apply(function () {
        _.each($scope.metric.legendData, function(legendItem, i){

            $scope.metric.legendData[i].highlighted = false;
        })
      });
    }
    var highLightLegend = function(event, x, points, row, seriesName){

       var hightLightedIndex = $scope.metric.legendData.map(function(legendItem){
         return legendItem.name;
       }).indexOf(seriesName);

      $scope.$apply(function () {
        _.each($scope.metric.legendData, function(legendItem, i){

         if(i === hightLightedIndex){

           $scope.metric.legendData[i].highlighted = true;

         }else{

           $scope.metric.legendData[i].highlighted = false;
         }
       })
      });
    }

    $scope.highlightSeries = function(seriesName){

      $scope.graph.setSelection(false, seriesName)
    }

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



    $scope.updateSelectedSeries = function() {


      _.each($scope.metric.legendData, function(legendItem, i){

            $scope.graph.setVisibility(legendItem.id, legendItem.visible);

      })

    }

    $scope.setAllSeriesSelected = function(setAllSeriesTo){

      _.each($scope.metric.legendData, function(legendItem, i){

        legendItem.visible = setAllSeriesTo;

        $scope.graph.setVisibility(legendItem.id, legendItem.visible);
      })
    };
    //$scope.$watch('selectAll', function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //
    //    _.each($scope.metric.legendData, function(legendItem, i){
    //
    //      legendItem.visible = newVal;
    //
    //    })
    //
    //  }
    //})


  };


}


