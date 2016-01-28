'use strict';
angular.module('graphs').controller('HighchartsController', [
  '$scope',
  'Graphite',
  '$stateParams',
  '$state',
  'TestRuns',
  'Metrics',
  'Dashboards',
  'Tags',
  'Events',
  '$document',
  'Utils',
  function ($scope, Graphite, $stateParams, $state, TestRuns, Metrics, Dashboards, Tags, Events, $document, Utils) {
    /* Zero copied logic */
    $scope.clipClicked = function () {
      $scope.showUrl = false;
    };
    $scope.hasFlash = function () {
      var hasFlash = false;
      try {
        var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (fo) {
          hasFlash = true;
          return hasFlash;
        }
      } catch (e) {
        if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] != undefined && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
          hasFlash = true;
          return hasFlash;
        }
      }
    };



    /* set graphType */
    Utils.graphType =  'testrun';

    /* set Tags form graph */
    $scope.setTags = function () {
      if ($scope.showTags) {
        switch ($scope.showTags) {
        case true:
          $scope.showTags = false;
          break;
        case false:
          $scope.showTags = true;
          break;
        }
      } else {
        $scope.showTags = true;
      }
    };
    /* update Tags form graph */
    $scope.updateTags = function () {
      $scope.showTags = false;
      Metrics.update($scope.metric).success(function (metric) {
        Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, metric.tags, function (updated) {
          if (updated) {
            Dashboards.update(Dashboards.selected).success(function (dashboard) {
              $scope.dashboard = Dashboards.selected;
              /* Get tags used in metrics */
              $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
            });
          }
        });
        $state.go('viewGraphs', {
          'productName': $stateParams.productName,
          'dashboardName': $stateParams.dashboardName,
          'testRunId': $stateParams.testRunId,
          tag: metric.tags[metric.tags.length - 1].text
        });
      });
    };
    $scope.tagRemoved = function (tag) {
      if (tag.text === $stateParams.tag) {
        Metrics.update($scope.metric).success(function (metric) {

          /* Update tags in Dashboard if any new are added */
          Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, $scope.metric.tags, function (tagsUpdated) {

            if (tagsUpdated) {

                Dashboards.update(Dashboards.selected).success(function (dashboard) {
                  $scope.dashboard = Dashboards.selected;
                  /* Get tags used in metrics */
                  $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
                });
            }
          });
          $state.go($state.current, {}, { reload: true });
        });
      }
    };
    /* generate deeplink to share metric graph */
    $scope.setMetricShareUrl = function (metric) {

      $scope.metricShareUrl = 'http://' + location.host + '/#!/graphs/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.testRunId + '/' + $stateParams.tag +  '?';
      //if (Utils.zoomFrom || $state.params.selectedSeries || Utils.metricFilter) {
      //  $scope.metricShareUrl = $scope.metricShareUrl + '?';
      //}
      if (Utils.zoomFrom) {
        $scope.metricShareUrl = $scope.metricShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
      }
      if ($state.params.selectedSeries) {
        $scope.metricShareUrl = $scope.metricShareUrl + '&selectedSeries=' + $state.params.selectedSeries;
      }

      $scope.metricShareUrl = $scope.metricShareUrl + '&metricFilter=' + encodeURIComponent(metric.alias);


      if ($scope.showUrl) {
        switch ($scope.showUrl) {
        case true:
          $scope.showUrl = false;
          break;
        case false:
          $scope.showUrl = true;
          break;
        }
      } else {
        $scope.showUrl = true;
      }
    };
    /* Open accordion by default, except for the "All" tab */
    $scope.$watch('value', function (newVal, oldVal) {

        if(newVal !== oldVal) {

          Utils.metricFilter = '';

        }
        if (newVal !== 'All') {
          _.each($scope.metrics, function (metric, i) {
            $scope.metrics[i].isOpen = true;
          });
        }

    });

    /* If zoom lock is checked, update all graphs when zoom is applied in one */
    //$scope.$watch(function (scope) {
    //  return Utils.zoomFrom;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //    var from = Utils.zoomFrom ? Utils.zoomFrom : TestRuns.selected.startEpoch;
    //    var until = Utils.zoomUntil ? Utils.zoomUntil : TestRuns.selected.endEpoch;
    //    var chart = angular.element($scope.graphSelector).highcharts();
    //    while (chart.series.length > 0) {
    //      chart.series[0].remove(false);  //deletes all series
    //    }
    //    chart.showLoading('Loading data ...');
    //    updateGraph(Utils.zoomFrom, Utils.zoomUntil, $scope.metric.targets, function (series) {
    //      chart.hideLoading();
    //      _.each(series, function (serie) {
    //        chart.addSeries(serie, false);
    //      });
    //      chart.redraw();
    //    });
    //  }
    //});

    var clickDetected = false;



    var defaultChartConfig = {
      chart: {
        type: 'line',
        zoomType: 'x',
        height: 500,
        events: {
          click: function(event) {
            if(clickDetected) {

              clickDetected = false;
              var eventTimestamp = new Date(Math.round(event.xAxis[0].value));
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
              setTimeout(function() {
                clickDetected = false;
              }, 500);
            }

          },
          redraw: function(){
            /* if selected series is provided, show this series only */
            if (TestRuns.selectedSeries && TestRuns.selectedSeries !== ''){

              var seriesIndex = this.series.map(function(series) { return series.name; }).indexOf(TestRuns.selectedSeries);

              var series = this.series;
              for (var i = 0; i < series.length; i++) {
                // rather than calling 'show()' and 'hide()' on the series', we use setVisible and then
                // call chart.redraw --- this is significantly faster since it involves fewer chart redraws
                if (series[i].index === seriesIndex) {
                  if (!series[i].visible)
                    series[i].setVisible(true, false);
                } else {
                  if (series[i].visible) {
                    series[i].setVisible(false, false);
                  } else {
                    series[i].setVisible(true, false);
                  }
                }
              }

              TestRuns.selectedSeries = '';

              return false;
            }
          }
        }
      },
      rangeSelector: { enabled: false },
      navigator: { enabled: false },
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        maxHeight: 100,
        labelFormatter: hcLabelRender,
        itemWidth: 300
      },
      tooltip: {
        enabled: true,
        shared: false,
        valueDecimals: 1
      },
      scrollbar: {
          enabled : false
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          events: {
            legendItemClick: function (e) {
              // Upon cmd-click of a legend item, rather than toggling visibility, we want to hide all other items.
              var hideAllOthers = e.browserEvent.metaKey || e.browserEvent.ctrlKey;
              if (hideAllOthers) {
                var seriesIndex = this.index;
                var series = this.chart.series;
                for (var i = 0; i < series.length; i++) {
                  // rather than calling 'show()' and 'hide()' on the series', we use setVisible and then
                  // call chart.redraw --- this is significantly faster since it involves fewer chart redraws
                  if (series[i].index === seriesIndex) {
                    if (!series[i].visible)
                      series[i].setVisible(true, false);
                  } else {
                    if (series[i].visible) {
                      series[i].setVisible(false, false);
                    } else {
                      series[i].setVisible(true, false);
                    }
                  }
                }
                //this.chart.redraw();
                return false;
              }
            },
            click: function (event) {
              // Upon cmd-click of a legend item, rather than toggling visibility, we want to hide all other items.
              var hideAllOthers = event.metaKey || event.ctrlKey;
              var seriesIndex = this.index;
              var series = this.chart.series;
              if (hideAllOthers) {
                for (var i = 0; i < series.length; i++) {
                  // rather than calling 'show()' and 'hide()' on the series', we use setVisible and then
                  // call chart.redraw --- this is significantly faster since it involves fewer chart redraws
                  if (series[i].index === seriesIndex) {
                    if (!series[i].visible)
                      series[i].setVisible(true, false);
                  } else {
                    if (series[i].visible) {
                      series[i].setVisible(false, false);
                    } else {
                      series[i].setVisible(true, false);
                    }
                  }
                }
              } else {
                series[seriesIndex].setVisible(false, false);
              }
              this.chart.redraw();
              return false;
            }
          }
        }
      },
      //series: $scope.series,
      title: { text: 'Hello' },
      xAxis: {
        minRange: 10000,
        events: {
          setExtremes: function (e) {
            var from = typeof e.min == 'undefined' && typeof e.max == 'undefined' ? TestRuns.selected.startEpoch : Math.round(e.min);
            var until = typeof e.min == 'undefined' && typeof e.max == 'undefined' ? TestRuns.selected.endEpoch : Math.round(e.max);
            /* If zoom lock is checked, set zoom timestamps in TestRuns service */
            if ($scope.zoomLock === true) {
              Utils.zoomFrom = from;
              Utils.zoomUntil = until;
              $scope.$apply();
            } else {
              var chart = angular.element($scope.graphSelector).highcharts();
              while (chart.series.length > 0) {
                chart.series[0].remove(false);  //deletes all series
              }
              chart.showLoading('Loading data ...');
              updateGraph(from, until, $scope.metric.targets, function (series) {
                chart.hideLoading();
                _.each(series, function (serie) {
                  chart.addSeries(serie, false);
                });
                chart.redraw();
              });
            }
          }
        },
        plotLines: []
      },
      series: [],
      yAxis: {
        min: 0,
        // this sets minimum values of y to 0
        plotLines: [{
            value: $scope.metric.requirementValue,
            width: 2,
            color: 'green',
            dashStyle: 'dash',
            label: {
              text: 'Requirement',
              align: 'left',
              y: -10,
              x: 0
            }
          }]
      }
    };
    $scope.initConfig = function (metric, index) {
      //$scope.graphSelector = '#chart-' + index;
      ////$scope.config = angular.extend(graphCfg);
      ////$scope.config.title.text = metric.alias;
      ////if (!metric.requirementValue)
      ////  $scope.config.yAxis.plotLines = [];
      ////$scope.config.chart.renderTo = 'chart-' + index;
      ////setTimeout(function () {
      //  //angular.element($scope.graphSelector).highcharts('StockChart', $scope.config);
      //  //var chart = angular.element($scope.graphSelector).highcharts();
      //
      //  //chart.showLoading('Loading data ...');
      //  /* Set the TestRuns.selected based on $stateParams*/
      //  TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
      //    TestRuns.selected = testRun;
      //    var from = Utils.zoomFrom ? Utils.zoomFrom : TestRuns.selected.startEpoch;
      //    var until = Utils.zoomUntil ? Utils.zoomUntil : TestRuns.selected.endEpoch;
      //    updateGraph(from, until, metric.targets, function (dygraphData) {
      //
      //      $scope.metric.opts = {
      //        //axes: axes,
      //        labels: dygraphData.labels,
      //        //customBars: expectMinMax,
      //        //showRangeSelector: true,
      //        //interactionModel: Dygraph.Interaction.defaultModel,
      //        //clickCallback: $.proxy(this._onDyClickCallback, this),
      //        //connectSeparatedPoints: true,
      //        //dateWindow: [detailStartDateTm.getTime(), detailEndDateTm.getTime()],
      //        //drawCallback: $.proxy(this._onDyDrawCallback, this),
      //        //zoomCallback: $.proxy(this._onDyZoomCallback, this),
      //        //digitsAfterDecimal: 2,
      //        legend: 'never',
      //        includeZero: true,
      //        valueRange: [0,dygraphData.maxValue ],
      //        //yRangePad: 10,
      //        labelsDivWidth: "100%"//,
      //        //axes : {
      //        //  x : {
      //        //    valueFormatter: Dygraph.dateString_,
      //        //    ticker: Dygraph.dateTicker
      //        //    //xValueParser: function(x) { return parseInt(x); }
      //        //  }
      //        //},
      //        //xValueParser: function(x) { return parseInt(x); },
      //
      //      };
      //
      //      $scope.metric.data = dygraphData.data;
      //      $scope.metric.legendData = dygraphData.legendData;
      //   });
      //  });

    };

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
    function hcLabelRender() {
      var s = this.name;
      var r = '';
      var lastAppended = 0;
      var lastSpace = -1;
      for (var i = 0; i < s.length; i++) {
        if (s.charAt(i) == ' ')
          lastSpace = i;
        if (i - lastAppended > 40) {
          if (lastSpace == -1)
            lastSpace = i;
          r += s.substring(lastAppended, lastSpace);
          lastAppended = lastSpace;
          lastSpace = -1;
          r += '<br>';
        }
      }
      r += s.substring(lastAppended, s.length);
      return r;
    }
  }
]);
