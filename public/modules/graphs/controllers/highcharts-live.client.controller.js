'use strict';

angular.module('graphs').controller('HighchartsLiveController', ['$scope', 'Interval', '$stateParams', '$state', 'Graphite', 'TestRuns', 'Metrics', 'Dashboards', 'Tags', '$q','$http', '$log',
    function($scope, Interval, $stateParams, $state, Graphite, TestRuns, Metrics, Dashboards, Tags,  $q, $http, $log) {

        /* Zero copied logic */

        $scope.clipClicked = function(){

            $scope.showUrl = false;

        }

        $scope.hasFlash = function () {
            var hasFlash = false;
            try {
                var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                if (fo) {
                    hasFlash = true;
                    return hasFlash;
                }
            } catch (e) {
                if (navigator.mimeTypes
                    && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
                    && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
                    hasFlash = true;
                    return hasFlash;
                }
            }
        }

        /* set Tags form graph */

        $scope.setTags = function (){

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


        }

        /* update Tags form graph */

        $scope.updateTags = function(){

            $scope.showTags = false;

            Metrics.update($scope.metric).success(function(metric){

                if(Dashboards.updateTags($scope.metric.tags)){

                    Dashboards.update().success(function(dashboard){

                        $scope.dashboard = Dashboards.selected;
                        /* Get tags used in metrics */
                        $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);

                    });

                }

                $state.go('viewLiveGraphs',{"productName":$stateParams.productName, "dashboardName":$stateParams.dashboardName, tag: metric.tags[metric.tags.length -1].text});


            });

        }

        $scope.tagRemoved = function(tag){

            if(tag.text === $stateParams.tag){

                Metrics.update($scope.metric).success(function(metric){

                    if(Dashboards.updateTags($scope.metric.tags)){

                        Dashboards.update().success(function(dashboard){

                            $scope.dashboard = Dashboards.selected;
                            /* Get tags used in metrics */
                            $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);

                        });

                    }

                    $state.go($state.current, {}, {reload: true});


                });

            }

        }

        /* generate deeplink to share metric graph */

        $scope.setMetricShareUrl = function(metricId){

            if(TestRuns.zoomFrom){

                $scope.metricShareUrl = location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.tag + '/' + metricId + '?zoomFrom=' + TestRuns.zoomFrom + '&zoomUntil=' + TestRuns.zoomUntil;

            }else {

                $scope.metricShareUrl = location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.tag + '/' + metricId;

            }
            if($scope.showUrl){

                switch($scope.showUrl){

                    case true:
                        $scope.showUrl = false;
                        break;
                    case false:
                        $scope.showUrl = true;
                        break;
                }

            }else{

                $scope.showUrl = true;
            }
        }


        /* If zoom is applied, replace series */
        $scope.$watch(function (scope) {
                return TestRuns.zoomFrom
            },
            function (newVal, oldVal) {

                if (newVal !== oldVal) {


                    var from = (TestRuns.zoomFrom) ? TestRuns.zoomFrom : TestRuns.selected.start;
                    var until = (TestRuns.zoomUntil) ? TestRuns.zoomUntil : TestRuns.selected.end;

                    updateGraph(from, until, $scope.metric.targets, false);

                }
            }
        );

        /* Open accordion by default, except for the "All" tab */

        $scope.$watch('value', function (newVal, oldVal) {

            if($stateParams.metricId){

                _.each($scope.metrics, function (metric, i) {

                    if(metric._id === $stateParams.metricId )
                        $scope.metrics[i].isOpen = true;

                })

            }else {

                if (newVal !== 'All') {

                    _.each($scope.metrics, function (metric, i) {

                        $scope.metrics[i].isOpen = true;

                    })

                }
            }
        });

        /* stop data polling when accordion is closed */

        $scope.$watch('metric.isOpen', function (newVal, oldVal) {

            if (newVal !== oldVal && newVal === false) Interval.clearIntervalForMetric($scope.metric._id);

        });

        /* stop data polling when element is destroyed by ng-if */

        $scope.$on("$destroy", function() {

            Interval.clearIntervalForMetric($scope.metric._id);

        });


        /* reinitialise graph when zoomRange is changed */

        $scope.$watch('zoomRange', function (newVal, oldVal) {

            if (newVal !== oldVal) {


                TestRuns.zoomRange = $scope.zoomRange;

                var seriesArray = $scope.config.series;
                var seriesArraySize = seriesArray.length;

                for (var i = 0; i < seriesArraySize; i++) {

                    seriesArray.splice(0, 1);
                }

                $scope.initConfig($scope.chart, $scope.metric);
            }
        });


        $scope.chart = {
            options: {
                chart: {
                    type: 'line',
                    zoomType: 'x',
                    height: 500,
                    events: {
                        load: function () {

                            /* Clear interval that might be already running for this metric */
                            Interval.clearIntervalForMetric($scope.metric._id);

                            var intervalId = setInterval(function () {

                                Graphite.getData($scope.zoomRange, 'now', $scope.metric.targets, 900, $stateParams.productName, $stateParams.dashboardName).then(function (graphiteSeries) {

                                    Graphite.addEvents(graphiteSeries, $scope.zoomRange, 'now', $stateParams.productName, $stateParams.dashboardName).then(function (series) {

                                            /* update series */
                                        _.each(series, function (serie) {

                                            _.each($scope.config.series, function (existingSerie, i) {


                                                if (serie.name === existingSerie.name) {

                                                    var newDatapoints = _.filter(serie.data, function (newDataPoint) {

                                                        var isNew = true;
                                                        _.each(existingSerie.data, function (existingDataPoint) {

                                                            if (newDataPoint[0] === existingDataPoint[0]) isNew = false;

                                                        })

                                                        return isNew;

                                                    })

                                                    if (newDatapoints.length > 0) {

                                                        _.each(newDatapoints, function (datapoint) {

                                                            $scope.config.series[i].data.push([datapoint[0], datapoint[1]]);
                                                        })

                                                    }

                                                    return;
                                                }
                                            })


                                        })
                                    });
                                });


                                console.log('intervalIds:' + Interval.active)
                            }, 10000);

                            Interval.active.push({intervalId: intervalId, metricId: $scope.metric._id});

                        }
                    }
                },
                rangeSelector: {
                    enabled: false
                },
                legend: {
                    enabled: true,
                    align: 'center',
                    verticalAlign: 'bottom',
                    maxHeight: 100
                    //layout: 'vertical'
                },
                tooltip:{
                    enabled:true,
                    shared: false,
                    valueDecimals: 1
                },
                exporting: {
                    filename: TestRuns.selected.testRunId + '_' + $scope.metric.alias
                },
                plotOptions: {
                    series: {
                        events: {
                            legendItemClick: function(e) {
                                // Upon cmd-click of a legend item, rather than toggling visibility, we want to hide all other items.
                                var hideAllOthers = e.browserEvent.metaKey || e.browserEvent.ctrlKey;
                                if (hideAllOthers) {
                                    var seriesIndex = this.index;
                                    var series = this.chart.series;


                                    for (var i = 0; i < series.length; i++) {
                                        // rather than calling 'show()' and 'hide()' on the series', we use setVisible and then
                                        // call chart.redraw --- this is significantly faster since it involves fewer chart redraws
                                        if (series[i].index === seriesIndex) {
                                            if (!series[i].visible) series[i].setVisible(true, false);
                                        } else {
                                            if (series[i].visible) {
                                                series[i].setVisible(false, false);
                                            } else {
                                                series[i].setVisible(true, false);
                                            }
                                        }
                                    }
                                    this.chart.redraw();
                                    return false;
                                }
                            }
                        }
                    }
                }


            },
            series: [],

            title: {
                text: 'Hello'
            },
            xAxis: {minRange: 10000,
                events: {
                    setExtremes: function (e) {

                        var from = (typeof e.min == 'undefined' && typeof e.max == 'undefined') ? $scope.zoomRange : Math.round(e.min);
                        var until = (typeof e.min == 'undefined' && typeof e.max == 'undefined') ? 'now' : Math.round(e.max);

                        /* If zoom lock is checked, set zoom timestamps in TestRuns service */
                        if ($scope.zoomLock) {

                            Interval.clearAll();
                            TestRuns.zoomFrom = from;
                            TestRuns.zoomUntil = until;
                            $scope.$apply();

                        } else {

                            Interval.clearIntervalForMetric($scope.metric._id);
                            updateGraph(from, until, $scope.metric.targets, true);

                        }
                    }
                },
                plotLines: []
            },
            yAxis: {
                min: 0 // this sets minimum values of y to 0
            },
            loading: false,
            useHighStocks: true

    }


        $scope.initConfig = function (config, metric) {
            //debugger;

            $scope.metric = metric;
            $scope.config = angular.copy(config);
            $scope.config.title.text = metric.alias;

            /* if deeplinked including zoom query params use these */
            var from = (TestRuns.zoomFrom) ? TestRuns.zoomFrom : $scope.zoomRange;
            var until = (TestRuns.zoomUntil) ? TestRuns.zoomUntil : 'now';

            updateGraph(from, until, metric.targets, true);


        }

        function updateGraph(from, until, targets, drawEvents){

            $scope.config.loading = true;

            Graphite.getData(from, until, targets, 900).then(function (series) {

                Graphite.addEvents(series, from, until, $stateParams.productName, $stateParams.dashboardName).then(function (seriesEvents) {


                    $scope.config.series = seriesEvents;

                    if(drawEvents) {
                        /* draw xAxis plotlines for events*/
                        if (seriesEvents[seriesEvents.length - 1].type) {

                            _.each(seriesEvents[seriesEvents.length - 1].data, function (flag) {

                                $scope.config.xAxis.plotLines.push(
                                    {
                                        value: flag.x,
                                        width: 1,
                                        color: 'blue',
                                        dashStyle: 'dash'
                                    }
                                );
                            })
                        }
                    }
                    $scope.config.loading = false;

                });

            });

        }
    }
]);
