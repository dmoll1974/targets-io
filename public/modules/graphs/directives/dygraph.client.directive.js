'use strict';

angular.module('graphs').directive('dygraph', DygraphDirective);

/* @ngInject */
function DygraphDirective ($timeout, Interval) {

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


          /* if no data , set title to 'No data available'*/

          if(scope.metric.graphNumberOfValidDatapoints === 0){

            if(scope.data.length > 0){

              scope.opts.title = 'No data available';
            }else {
              scope.data = 'X\n';
              scope.opts.title = 'Error, check your Graphite query';
            }
          }

          /* if no data (due to error), set title to error message */

          //if(!scope.data){
          //
          //  scope.data = [0,0];
          //  scope.opts.title = 'Ouch something went wrong, double check your Graphite query';
          //
          //}



          scope.graph = new Dygraph(elem.children()[0], scope.data, scope.opts);


          scope.graph.ready(function() {



            /* set y-axis range to highest of the selected series */

            var maxValue = getMaximumOfSelectedSeries(scope.metric.legendData);
            scope.graph.updateOptions({
              valueRange: [0, maxValue]
            });

            /* add colors to legend */
            var colors = scope.graph.getColors();

            _.each(scope.metric.legendData, function(legendItem, i){

              if(scope.metric.legendData[i].numberOfValidDatapoints > 0 ){

                scope.metric.legendData[i].color = colors[i];

              }

            })

            /* add annotation to graph */
            var annotations = scope.graph.annotations();

            _.each(scope.metric.annotations, function(annotationFromEvent){

              annotations.push(annotationFromEvent);

            })
            scope.graph.setAnnotations(annotations);


          });

         
        }

      });

      function getMaximumOfSelectedSeries(legendData){

        var maxValue = 0;

        _.each(legendData, function(legendItem){

          if(legendItem.visible === true && legendItem.max > maxValue ) maxValue = legendItem.max;
        })

        return maxValue;
      }

    }
  };

  return directive;

  /* @ngInject */
  function DygraphController($scope, $state, $stateParams, $rootScope, $timeout, TestRuns, Graphite, Events, Utils) {

    $scope.selectAll = true;

    var clickDetected = false;

    /* set zoomLock */

    $scope.zoomLock =  Utils.zoomLock;

    /* watch zoomLock */

    $scope.$watch(function (scope) {
      return Utils.zoomLock;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {

        $scope.zoomLock =  Utils.zoomLock;
      }
    });

   

    /* watch zoomRange */
    $scope.$watch(function (scope) {
      return Utils.zoomRange;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {

        $scope.zoomRange =  Utils.zoomRange;
      }
    });

    /* If zoom lock is checked, update all graphs when zoom is applied in one */
    $scope.$watch(function (scope) {
      return Utils.zoomFrom;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal && $scope.zoomLock === true) {

        drawDypraph($scope.graphType);

      }
    });

    setTimeout(function(){

      $scope.graphType =  Utils.graphType;
      drawDypraph($scope.graphType);

    });


    function drawDypraph(graphType)  {

      $scope.loading = true;

      switch(graphType){

        case 'testrun':

          TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
            TestRuns.selected = testRun;
            var from = Utils.zoomFrom ? Utils.zoomFrom : TestRuns.selected.startEpoch;
            var until = Utils.zoomUntil ? Utils.zoomUntil : TestRuns.selected.endEpoch;

            processGraph(from, until);

          });

          break;

        case 'live-graph':

          $scope.zoomRange =  Utils.zoomRange;
            
          var from = Utils.zoomFrom ? Utils.zoomFrom : $scope.zoomRange;
          var until = Utils.zoomUntil ? Utils.zoomUntil : 'now';

          processGraph(from, until);

          break;
      }

      function processGraph(from, until)
      {

        updateGraph(from, until, $scope.metric.targets, function (dygraphData) {

          $scope.opts = {
            labels: dygraphData.labels,
            axisLabelFontSize: 12,
            legend: 'never',
            includeZero: true,
            valueRange: [0, dygraphData.maxValue],
            highlightCircleSize: 0,
            highlightSeriesOpts: {
              strokeWidth: 2
            },
            highlightCallback: highLightLegend,
            unhighlightCallback: unHighLightLegend,
            axes: {
              x: {
                axisLabelFormatter: Dygraph.dateAxisLabelFormatter,
                valueFormatter: Dygraph.dateString_
              }
            },
            underlayCallback: createUnderlayFormEvents,
            clickCallback: createEventFromClick,
            zoomCallback: zoomGraph
          };

          $scope.data = dygraphData.data;
          $scope.metric.legendData = dygraphData.legendData;

          /* synchronyze anotations with datapoints */

          _.each(dygraphData.annotations, function (annotation) {

            annotation = synchronizeWithDataPoint(annotation);
          })


          $scope.metric.annotations = dygraphData.annotations;
          $scope.metric.graphNumberOfValidDatapoints = dygraphData.graphNumberOfValidDatapoints;
          $scope.loading = false;

          /* in case of live graphs set interval */
          if($scope.graphType === 'live-graph' &&  Interval.active.map(function(interval){return interval.metricId}).indexOf($scope.metric._id) === -1){

            var intervalId = setInterval(function () {

              drawDypraph($scope.graphType);

            }, 10000);

            Interval.active.push({
              intervalId: intervalId,
              metricId: $scope.metric._id
            });

            /* if zoomrange execeeds 3h, don't update graph due to bad performance*/

            if(!($scope.zoomRange === '-10min' || $scope.zoomRange === '-30min' || $scope.zoomRange === '-1h' || $scope.zoomRange === '-3h' )){
              Interval.clearAll();
            }

          }
        });

      }


    }

    function createUnderlayFormEvents  (canvas, area, g) {
      if($scope.data.length > 0) {
        /* get full range of graph to determine width of underlay */
        var xAxisRange = new Date($scope.data[$scope.data.length - 1][0]).getTime() - new Date($scope.data[0][0]).getTime();
        _.each($scope.metric.annotations, function (annotation) {
          var bottom_left = g.toDomCoords(annotation.x, -20);
          var top_right = g.toDomCoords(annotation.x + (xAxisRange / 800), +20);

          var left = bottom_left[0];
          var right = top_right[0];

          canvas.fillStyle = "#FF5722";
          canvas.fillRect(left, area.y, right - left, area.h);
        })
      }
    }

    function createEventFromClick  (e, x, points) {

      if (clickDetected) {

        clickDetected = false;
        var eventTimestamp = x;
        Events.selected.productName = $stateParams.productName;
        Events.selected.dashboardName = $stateParams.dashboardName;
        Events.selected.eventTimestamp = eventTimestamp;
        Events.selected.testRunId = $stateParams.testRunId;
        Events.selected.eventDescription = '';

        $state.go('createEvent', {
          productName: $stateParams.productName,
          dashboardName: $stateParams.dashboardName
        });

      } else {
        clickDetected = true;
        setTimeout(function () {
          clickDetected = false;
        }, 500);
      }
    }

    function zoomGraph(minDate, maxDate, yRange){

      Utils.zoomFrom = Math.round(minDate);
      Utils.zoomUntil= Math.round(maxDate);
       drawDypraph($scope.graphType);
    }



    function synchronizeWithDataPoint (annotationFromEvent){

      var synchronizedAnnotationTimestamp = annotationFromEvent ;

      for(var i=0;i < $scope.data.length; i++){

        if(new Date($scope.data[i][0]).getTime() > annotationFromEvent.x){

          synchronizedAnnotationTimestamp.x = new Date($scope.data[i][0]).getTime();
          break;
        }
      }

      return synchronizedAnnotationTimestamp;
    }

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
        if (series.data.length > 0) {
          Graphite.addEvents(series, from, until, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).then(function (seriesEvents) {
            callback(seriesEvents);
          });
        } else {
          callback(series);
        }
      });
    }



    $scope.updateSelectedSeries = function() {

      /* show / hide selected series in legend */

      _.each($scope.metric.legendData, function(legendItem, i){

            $scope.graph.setVisibility(legendItem.id, legendItem.visible);

      })

      /* set y-axis range to highest of the selected series */

      var maxValue = getMaximumOfSelectedSeries($scope.metric.legendData);
      $scope.graph.updateOptions({
        valueRange: [0,maxValue ]
      });

    }

    $scope.setAllSeriesSelected = function(setAllSeriesTo){

      _.each($scope.metric.legendData, function(legendItem, i){

        legendItem.visible = setAllSeriesTo;

        $scope.graph.setVisibility(legendItem.id, legendItem.visible);
      })

      /* set y-axis range to highest of the selected series */

      var maxValue = getMaximumOfSelectedSeries($scope.metric.legendData);
      $scope.graph.updateOptions({
        valueRange: [0,maxValue ]
      });

    };

    function getMaximumOfSelectedSeries(legendData){

      var maxValue = 0;

      _.each(legendData, function(legendItem){

        if(legendItem.visible === true && legendItem.max > maxValue ) maxValue = legendItem.max;
      })

      return maxValue;
    }

  };


}


