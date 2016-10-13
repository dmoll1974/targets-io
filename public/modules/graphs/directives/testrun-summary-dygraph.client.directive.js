'use strict';

angular.module('graphs').directive('testrunSummaryDygraph', DygraphDirective);

/* @ngInject */
function DygraphDirective ($timeout, Interval, TestRuns, Utils) {

  var directive = {

    restrict: 'E',
    scope: {
      metric: '=',
      testrun: '='
     },
    //template: '<div flex class="dygraph-div"  style="width:100%;"><legend legend="legend" style="margin-top: 20px; margin-left: 30px;"></legend>',
    templateUrl: 'modules/graphs/directives/testrun-summary-dygraph.client.view.html',
    controller: DygraphController,
    //
    link: function(scope, elem, attrs) {

      scope.$watch('loading', function (newVal, oldVal) {
        if (/*newVal !== oldVal && */newVal !== true) {


          /* if no data , set title to 'No data available'*/

          if(scope.metric.graphNumberOfValidDatapoints === 0){

            if(scope.metric.data.length > 0){

              scope.opts.title = 'No data available';
            }else {
              scope.metric.data = 'X\n';
              scope.opts.title = 'Error, check your Graphite query';
            }
          }




          scope.graph = new Dygraph(elem.children()[0].children[1], scope.metric.data, scope.opts);


          scope.graph.ready(function() {

            /* if selected series is provided (via deeplink), show this series only */
            if (Utils.selectedSeries && Utils.selectedSeries !== '' /*&& Utils.metricFilter === scope.metric.alias*/) {

              /* show / hide selected series in legend */

              _.each(scope.metric.legendData, function (legendItem, i) {

                scope.graph.setVisibility(legendItem.id, legendItem.visible);

              })

            }

            /* if selected series have been set via the legend, set them again after reload or zoom */
            if(scope.selectedSeries){


                _.each(scope.metric.legendData, function (legendItem, i) {
                  _.each(scope.selectedSeries, function (series) {

                    if(legendItem.name === series.name)
                      scope.metric.legendData[i].visible = series.visible;

                  })
                })

                _.each(scope.metric.legendData, function (legendItem, i) {

                  scope.graph.setVisibility(legendItem.id, legendItem.visible);

                })

            }

            /* set y-axis range depending on zoom action*/

              var yRange = (scope.horizontalZoom) ? [0, getMaximumOfSelectedSeries(scope.metric.legendData)] : scope.zoomedYRange;
              scope.graph.updateOptions({
                valueRange: yRange
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
    $scope.showLegend =  true;
    $scope.horizontalZoom = true;

    var clickDetected = false;

    /* set zoomLock to false */
    $scope.zoomLock =  false;
    $scope.graphType =  'testrun';

    $scope.showProgressBar = true;
    $scope.loading = true;




    /* watch zoomRange */
    $scope.$watch(function (scope) {
      return Utils.zoomRange;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {

        Interval.clearAll();

        $scope.zoomRange =  Utils.zoomRange;

        $scope.showProgressBar = true;

        drawDypraph($scope.graphType);
      }
    });

    /* If zoom lock is checked, update all graphs when zoom is applied in one */
    $scope.$watch(function (scope) {
      return Utils.zoomFrom;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal && $scope.zoomLock === true) {

        $scope.showProgressBar = true;

        drawDypraph($scope.graphType);

      }
    });








      /* if dygraphData is already available form db, and we are not zooming, use the data from db */

    //setTimeout(function(){


      if($scope.metric.dygraphData && !$scope.graphZoomed){

        setTimeout(function(){
          console.log('Drawing graph from persisted data!')
          processGraphData(convertTimeStamps($scope.metric.dygraphData));
        });

      }else {


        drawDypraph($scope.graphType);
      }


    function convertTimeStamps(dygraphData){

      _.each(dygraphData.data, function(dataline){

            dataline[0] = new Date(dataline[0]);

          ///* set null values to NaN to show holes in graphs */
          //_.each(dataline, function(datalineItem){
          //
          //  if (datalineItem[0] === null) {
          //    datalineItem[0] = NaN;
          //  }
          //
          //})


      })

      return dygraphData;
    }

    function processGraphData(dygraphData) {

      $scope.opts = {
        connectSeparatedPoints: true,
        labels: dygraphData.labels,
        axisLabelFontSize: 12,
        legend: 'never',
        includeZero: true,
        valueRange: $scope.yRange,
        highlightCircleSize: 0,
        highlightSeriesOpts: {
          strokeWidth: 2
        },
        ylabel: $scope.metric.unit !== 'None'? $scope.metric.unit : '' ,
        yLabelWidth: 14,
        highlightCallback: highLightLegend,
        unhighlightCallback: unHighLightLegend,
        axes: {
          x: {
            axisLabelFormatter: Dygraph.dateAxisLabelFormatter,
            valueFormatter: Dygraph.dateString_
          }
        },
        underlayCallback: createUnderlayFormEvents,
        //clickCallback: createEventFromClick,
        //zoomCallback: zoomGraph
      };

      $scope.metric.dygraphData = dygraphData;
      $scope.metric.data = dygraphData.data;
      $scope.metric.legendData = dygraphData.legendData;

      /* set all legendItems to visible */

        _.each($scope.metric.legendData, function(legendItem, i) {

          $scope.metric.legendData[i].visible = true;

        });




      $scope.yRange = ($scope.zoomedYRange) ? $scope.zoomedYRange : [0, dygraphData.maxValue];

      /* synchronyze anotations with datapoints */

      _.each(dygraphData.annotations, function (annotation) {

        annotation = synchronizeWithDataPoint(annotation);
      })


      $scope.metric.annotations = dygraphData.annotations;
      $scope.metric.graphNumberOfValidDatapoints = dygraphData.graphNumberOfValidDatapoints;

      $scope.loading = false;
      $scope.showProgressBar = false;

      /* if selected series is provided, show this series only */
      if (Utils.selectedSeries && Utils.selectedSeries !== '' ) {

        $scope.selectAll = false;

        _.each($scope.metric.legendData, function(legendItem, i){

          if(legendItem.name === Utils.selectedSeries ) {

            $scope.metric.legendData[i].visible = true;

          }else{

            $scope.metric.legendData[i].visible = false;

          }

        })


      }

    }

    function drawDypraph(graphType)  {

        switch (graphType) {

          case 'testrun':

              var testRunId = $stateParams.testRunId ? $stateParams.testRunId : $scope.testrun.testRunId;

            TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, testRunId).success(function (testRun) {
              TestRuns.selected = testRun;
              var from = /*Utils.zoomFrom ? Utils.zoomFrom : */TestRuns.selected.startEpoch;
              var until =/* Utils.zoomUntil ? Utils.zoomUntil :*/ TestRuns.selected.endEpoch;

              processGraph(from, until);

            });

            break;

          case 'live-graph':

            $scope.zoomRange = Utils.zoomRange;

            var from = Utils.zoomFrom ? Utils.zoomFrom : $scope.zoomRange.value;
            var until = Utils.zoomUntil ? Utils.zoomUntil : 'now';

            processGraph(from, until);

            break;
        }

        function processGraph(from, until) {

          getGraphData(from, until, $scope.metric.targets, function (dygraphData) {

            processGraphData(dygraphData);
          });

        }

    }

    function createUnderlayFormEvents  (canvas, area, g) {
      if($scope.metric.data.length > 0) {
        /* get full range of graph to determine width of underlay */
        var xAxisRange = new Date($scope.metric.data[$scope.metric.data.length - 1][0]).getTime() - new Date($scope.metric.data[0][0]).getTime();
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
        Events.selected.productName = $scope.testrun.productName;
        Events.selected.dashboardName = $scope.testrun.dashboardName;
        Events.selected.eventTimestamp = eventTimestamp;
        Events.selected.testRunId = $scope.testrun.testRunId;
        Events.selected.eventDescription = '';

        $state.go('createEvent', {
          productName: $scope.testrun,
          dashboardName: $scope.testrun.dashboardName
        });

      } else {
        clickDetected = true;
        setTimeout(function () {
          clickDetected = false;
        }, 500);
      }
    }

    function zoomGraph(minDate, maxDate, yRange){

      //var fromBeforeZoom = (Utils.zoomFrom) ? Utils.zoomFrom : TestRuns.selected.startEpoch;
      //var untilBeforeZoom = (Utils.zoomUntil) ? Utils.zoomUntil : TestRuns.selected.endEpoch;

      $scope.graphZoomed = true;

      /* determine if horizontalZoom has been done*/

      //$scope.horizontalZoom = ((maxDate - minDate)/(untilBeforeZoom - fromBeforeZoom)) > 0.99 ? false : true;
      //
      //
      //Utils.zoomFrom = Math.round(minDate);
      //Utils.zoomUntil= Math.round(maxDate);
      //$scope.zoomedYRange = [Math.round(yRange[0][0]),Math.round(yRange[0][1])];
      // drawDypraph($scope.graphType);
    }


    $scope.resetZoom = function(){

      /* reset from and until */
      //Utils.zoomFrom = TestRuns.selected.startEpoch;
      //Utils.zoomUntil= TestRuns.selected.endEpoch;

      /* set graph to unzoomed */
      $scope.graphZoomed = false;

      $scope.graph.updateOptions({
        dateWindow: null,
        valueRange: null
      });
      /* redraw graph */


      //drawDypraph($scope.graphType);
    }

    function synchronizeWithDataPoint (annotationFromEvent){

      var synchronizedAnnotationTimestamp = annotationFromEvent ;

      for(var i=0;i < $scope.metric.data.length; i++){

        if(new Date($scope.metric.data[i][0]).getTime() > annotationFromEvent.x){

          synchronizedAnnotationTimestamp.x = new Date($scope.metric.data[i][0]).getTime();
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

    function getGraphData(from, until, targets, callback) {
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
      setTimeout(function(){

        _.each($scope.metric.legendData, function(legendItem, i){

            $scope.graph.setVisibility(legendItem.id, legendItem.visible);

        })

        /* set y-axis range to highest of the selected series */

        var maxValue = getMaximumOfSelectedSeries($scope.metric.legendData);
        $scope.graph.updateOptions({
          valueRange: [0,maxValue ]
        });

        $scope.selectAll = false;

        /* save series visibilty to apply after zoom or live reload */
        saveSeriesVisibility($scope.metric.legendData);

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

      $scope.selectAll = false;

      /* save series visibilty to apply after zoom or live reload */
      saveSeriesVisibility($scope.metric.legendData);

    };

    $scope.selectSeriesToggle = function (selectedLegendItem){

      var selectedSeriesIndex = $scope.metric.legendData.map(function(legendItem){return legendItem.id;}).indexOf(selectedLegendItem.id);

      if (selectedLegendItem.visible === true){

        $scope.metric.legendData[selectedSeriesIndex].visible = false;
        $scope.graph.setVisibility($scope.metric.legendData[selectedSeriesIndex].id, $scope.metric.legendData[selectedSeriesIndex].visible);

      }else{

        $scope.metric.legendData[selectedSeriesIndex].visible = true;
        $scope.graph.setVisibility($scope.metric.legendData[selectedSeriesIndex].id, $scope.metric.legendData[selectedSeriesIndex].visible);
      }

      /* set y-axis range to highest of the selected series */

      var maxValue = getMaximumOfSelectedSeries($scope.metric.legendData);
      $scope.graph.updateOptions({
        valueRange: [0,maxValue ]
      });

      $scope.selectAll = false;

      /* save series visibilty to apply after zoom or live reload */
      saveSeriesVisibility($scope.metric.legendData);

    }

    function saveSeriesVisibility(legendData){

      var selectedSeries = [];

      _.each(legendData, function(legendItem){

          selectedSeries.push({name: legendItem.name, visible: legendItem.visible});
      })

      $scope.selectedSeries = selectedSeries;

    };

    $scope.selectOtherSeriesToggle = function (selectedLegendItem){

      var selectedSeriesIndex = $scope.metric.legendData.map(function(legendItem){return legendItem.id;}).indexOf(selectedLegendItem.id);

      //if (selectedLegendItem.visible === true) {

        $scope.metric.legendData[selectedSeriesIndex].visible = true;
        $scope.graph.setVisibility($scope.metric.legendData[selectedSeriesIndex].id, $scope.metric.legendData[selectedSeriesIndex].visible);

        _.each($scope.metric.legendData, function (legendItem, i) {

          if (legendItem.id !== selectedLegendItem.id) {

            $scope.metric.legendData[i].visible = false;
            $scope.graph.setVisibility($scope.metric.legendData[i].id, $scope.metric.legendData[i].visible);

          }
        });

        /* set y-axis range to highest of the selected series */

        var maxValue = getMaximumOfSelectedSeries($scope.metric.legendData);
        $scope.graph.updateOptions({
          valueRange: [0, maxValue]
        });

      $scope.selectAll = false;


      /* save series visibilty to apply after zoom or live reload */
      saveSeriesVisibility($scope.metric.legendData);
      //}
    }


    function getMaximumOfSelectedSeries(legendData){

      var maxValue = 0;

      _.each(legendData, function(legendItem){

        if(legendItem.visible === true && legendItem.max > maxValue ) maxValue = legendItem.max;
      })

      return maxValue;
    }

  };


}


