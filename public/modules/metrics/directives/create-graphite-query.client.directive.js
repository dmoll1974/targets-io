'use strict';

angular.module('metrics').directive('createGraphiteQuery', CreateGraphiteQueryDirective);

function CreateGraphiteQueryDirective () {

    var directive = {
        scope: {
            metric: '=',
            index: '='
        },
        restrict: 'EA',
        templateUrl: 'modules/metrics/directives/create-graphite-query.client.view.html',
        controller: CreateGraphiteQueryDirectiveController,
        controllerAs: 'ctrlCreateGraphiteQuery'
    };

    return directive;

    /* @ngInject */
    function CreateGraphiteQueryDirectiveController ($scope, $state, $timeout, Graphite, $mdDialog, Utils) {


        $scope.showTargetAutocompleteDialog = showTargetAutocompleteDialog;


        /* Watches */

        /* watch zoomRange */
        $scope.$watch('zoomRange', function (newVal, oldVal) {

            if(oldVal && oldVal !== newVal)
            Utils.zoomRangeTargetPreview = $scope.zoomRange;

        });

        /* Functions */

        function showTargetAutocompleteDialog($event){

            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                preserveScope : true,
                templateUrl: 'modules/metrics/views/create-graphite-query-dialog.client.view.html',
                scope: $scope,
                locals: {
                    selectedTarget: $scope.metric.targets[$scope.index],
                    index: $scope.index
                },
                onComplete: function () {
                    setTimeout(function(){
                        document.querySelector('#targetAutoComplete').focus();
                    },1);
                },
                controller: DialogController
            });

            function DialogController($scope, $mdDialog, selectedTarget, index, Utils) {

                $scope.selectedTarget = selectedTarget;
                $scope.index = index;
                $scope.showPreview = false;

                $scope.filterGraphiteTargets = function(query) {

                    var results = query ? $scope.graphiteTargets.filter( createFilterForTargets(query) ) : $scope.graphiteTargets;

                    return results;

                }

                console.log('target: ' + $scope.selectedTarget);

                var initialQuery = $scope.selectedTarget.length > 0 ? $scope.selectedTarget : '*';

                /* get initial values for graphite target picker*/
                Graphite.findMetrics(initialQuery).success(function(graphiteTargetsLeafs) {

                    var graphiteTargets = [];

                    _.each(graphiteTargetsLeafs, function (graphiteTargetsLeaf) {
                        graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
                    });

                    $scope.defaultGraphiteTargets = graphiteTargets;
                    $scope.graphiteTargets = $scope.defaultGraphiteTargets;
                    $scope.expandable = true;

                });


                /* remove trailing dot */
                if($scope.selectedTarget.lastIndexOf('.') === ($scope.selectedTarget.length - 1)){
                    $scope.selectedTarget = $scope.selectedTarget.substring(0, $scope.selectedTarget.length - 1);
                }

                /* Check if current target returns any 'leafs'*/

                Graphite.findMetrics($scope.selectedTarget + '.*').success(function(graphiteTargetsLeafs) {

                    /* if leafs are present, add wildcard '*' */
                    if (graphiteTargetsLeafs.length > 0) {
                        var graphiteTargets = [];
                        graphiteTargets.push({text: '*', id: '*'});

                        _.each(graphiteTargetsLeafs, function (graphiteTargetsLeaf) {
                            graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
                        });

                        $scope.graphiteTargets = graphiteTargets;

                        /* if no leafs, show root query results*/
                    } else {

                        $scope.graphiteTargets = $scope.defaultGraphiteTargets;

                    }


                });



                /* get targets from Graphite */

                $scope.getTargets = function(selectedTarget, graphiteTargetId, targetIndex) {

                    updateTargets (selectedTarget, graphiteTargetId);
                }


                function updateTargets (selectedTarget, graphiteTargetId){


                    if(graphiteTargetId !== undefined && graphiteTargetId !== null && graphiteTargetId !== '') {

                        var query;
                        $scope.expandable = false;
                        $scope.targetComplete = false;

                        if (graphiteTargetId === '*') {

                            query = selectedTarget + '.' + graphiteTargetId;// + '.*';

                        } else {

                            query = graphiteTargetId + '.*';
                        }

                        Graphite.findMetrics(query).success(function (graphiteTargetsLeafs) {

                            var graphiteTargets = [];
                            if (graphiteTargetsLeafs.length > 0) {

                                //$scope.expandable = isExpandable(graphiteTargetsLeafs);
                                $scope.expandable = true;

                                graphiteTargets.push({text: '*', id: '*'});
                                _.each(graphiteTargetsLeafs, function (graphiteTargetsLeaf) {
                                    graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
                                });
                            }

                            $scope.graphiteTargets = graphiteTargets;

                            if (graphiteTargetId === '*') {

                                //$timeout(function () {
                                $scope.selectedTarget = $scope.expandable ? selectedTarget + '.' + graphiteTargetId + '.*' : selectedTarget + '.' + graphiteTargetId;

                                /* if not expandable, hide the autoComplete*/

                                if ($scope.expandable === false) {

                                    $scope.targetComplete = true;

                                } else {

                                    //$scope.$$childTail.graphiteTarget = undefined;
                                    //$scope.$$childTail.graphiteTargetSearchText = '';
                                    $scope.graphiteTarget = undefined;
                                    $scope.graphiteTargetSearchText = '';
                                }

                                //}, 0);

                            } else {
                                //$timeout(function () {
                                $scope.selectedTarget = $scope.expandable ? graphiteTargetId + '.*' : graphiteTargetId;

                                /* if not expandable, hide the autoComplete*/

                                if ($scope.expandable === false) {

                                    $scope.targetComplete = true;

                                } else {


                                    //$scope.$$childTail.graphiteTarget = undefined;
                                    //$scope.$$childTail.graphiteTargetSearchText = '';
                                    $scope.graphiteTarget = undefined;
                                    $scope.graphiteTargetSearchText = '';
                                }

                            }



                        });
                    }
                };

                $scope.done = function($event){

                    $scope.metric.targets[$scope.index] = $scope.selectedTarget;
                    $mdDialog.hide();
                }

                $scope.cancel = function($event){

                    $scope.graphiteTarget = undefined;
                    $scope.graphiteTargetSearchText = '';
                    $scope.selectedTarget = undefined
                    $mdDialog.cancel();
                }

                $scope.revert = function(){

                    /* remove trailing '.*' if there*/

                    $scope.selectedTarget = $scope.selectedTarget.match(/\./g).length > 0 ? $scope.selectedTarget.substring(0,$scope.selectedTarget.indexOf($scope.selectedTarget.split('.')[$scope.selectedTarget.split('.').length - 2])) + '*' : '*' ;

                    //updateTargets ($scope.selectedTarget, $scope.selectedTarget);

                    Graphite.findMetrics($scope.selectedTarget).success(function(graphiteTargetsLeafs) {

                        /* if leafs are present, add wildcard '*' */
                        if (graphiteTargetsLeafs.length > 0) {
                            var graphiteTargets = [];
                            graphiteTargets.push({text: '*', id: '*'});

                            _.each(graphiteTargetsLeafs, function (graphiteTargetsLeaf) {
                                graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
                            });

                            $scope.graphiteTargets = graphiteTargets;
                            $scope.targetComplete = false;
                            $scope.graphiteTarget = undefined;
                            $scope.graphiteTargetSearchText = '';

                            setTimeout(function(){
                                document.querySelector('#targetAutoComplete').focus();
                            },200);

                            /* if no leafs, show root query results*/
                        } else {

                            $scope.graphiteTargets = $scope.defaultGraphiteTargets;

                        }

                        setTimeout(function(){
                            document.querySelector('#targetAutoComplete').focus();
                        },1);


                    });

                }

                function createFilterForTargets(query) {
                    var upperCaseQuery = angular.uppercase(query);
                    return function filterFn(graphiteTarget) {
                        return (graphiteTarget.text.toUpperCase().indexOf(upperCaseQuery) !== -1  );
                    };
                }


                $scope.zoomOptions = [
                    {value: '-10min' , label: 'Last 10 minutes'},
                    {value: '-30min' , label: 'Last 30 minutes'},
                    {value: '-1h', label: 'Last hour'},
                    {value: '-3h', label: 'Last 3 hours'}
                ];

                $scope.zoomRange = Utils.zoomRangeTargetPreview;
                /* set md-select selected item */
                $scope.selectedZoomOptionIndex = $scope.zoomOptions.map(function(zoomOption){return zoomOption.label;}).indexOf($scope.zoomRange.label);




                $scope.updatePreview = function (){

                    $scope.showPreview = false;

                    $scope.metric.targets[$scope.index] = $scope.selectedTarget;

                    $timeout(function(){

                        $scope.showPreview = true;


                    })
                }



                $scope.wrapInFunction = function(){

                    $scope.metric.targets[$scope.index] = $scope.selectedTarget;
                    $mdDialog.hide();

                    $mdDialog.show({
                        parent: parentEl,
                        targetEvent: $event,
                        preserveScope : true,
                        templateUrl: 'modules/metrics/views/wrap-target-in-function-dialog.client.view.html',
                        scope: $scope,
                        locals: {
                            preview: $scope.metric.targets[$scope.index],
                            index: $scope.index
                        },
                        onComplete: function () {
                            setTimeout(function(){
                                document.querySelector('#graphiteFunctionAutoComplete').focus();
                            },1);
                        },
                        controller: DialogController
                    });

                    function DialogController($scope, $mdDialog, preview, index, Utils) {

                        $scope.graphiteFunctions = [
                            {
                                name: 'aliasByNode',
                                description: 'Takes a seriesList and applies an alias derived from one or more “node” portion/s of the target name. Node indices are 0 indexed.',
                                example: 'aliasByNode(gatling2.cis.checkin.ok.percentiles99,2,4) //prints in legend: checkin.percentiles99',
                                argument: '',
                                template: 'aliasByNode($TARGET,$ARGUMENT)'
                            },
                            {
                                name: 'alias',
                                description: 'Takes one metric or a wildcard seriesList and a string in quotes. Prints the string instead of the metric name in the legend.',
                                example: 'alias(gatling2.cis.allRequests.ok.count,"Passed Transactions per Second") //prints in legend: "Passed Transactions per Second"',
                                argument: '',
                                template: 'alias($TARGET,"$ARGUMENT")'
                            },
                            {
                                name: 'scaleToSeconds',
                                description: 'Takes one metric or a wildcard seriesList and returns “value per seconds” where seconds is a last argument to this functions.',
                                example: 'scaleToSeconds(gatling2.cis.allRequests.ok.count,1',
                                argument: '1',
                                template: 'scaleToSeconds($TARGET,$ARGUMENT)'
                            },
                            {
                                name: 'scale',
                                description: 'Takes one metric or a wildcard seriesList followed by a constant, and multiplies the datapoint by the constant provided at each point.',
                                example: 'scale(kl12cffs.Tomcat.cis-load_a_ae1_*_server_*.15s.GC_Heap.Bytes_In_Use, 0.0000009765625) // scales bytes to Mb',
                                argument: '',
                                template: 'scale($TARGET,$ARGUMENT)'
                            },
                            {
                                name: 'sumSeries',
                                description: 'Takes one metric or a wildcard seriesList followed by a constant, and multiplies the datapoint by the constant provided at each point.',
                                example: 'alias(scaleToSeconds(sumSeries(gatling2.icird.UC*_*_Agree*.ok.count),1),"Checkins per second") // summarizes all transactions count matching pattern',
                                argument: undefined,
                                template: 'sumSeries($TARGET)'
                            },
                            {
                                name: 'averageSeries',
                                description: 'Takes one metric or a wildcard seriesList. Draws the average value of all metrics passed at each time.',
                                example: 'averageSeries(kl12cffs.Tomcat.cis-load_a_ae1_*_server_*.15s.CPU.Processor_*.Utilization_percentage_aggregate) // averages all cpu cores utilization',
                                argument: undefined,
                                template: 'averageSeries($TARGET)'
                            },
                            {
                                name: 'asPercent',
                                description: 'Calculates a percentage of the total of a wildcard series. If total is specified, each series will be calculated as a percentage of that total. If total is not specified, the sum of all points in the wildcard series will be used instead.',
                                example: 'asPercent(integral(gatling2.icird.allRequests.ko.count), integral(gatling2.icird.allRequests.all.count)) // calculate percentage of failed transactions ',
                                argument: '',
                                template: 'asPercent($TARGET,$ARGUMENT)'
                            },
                            {
                                name: 'nonNegativeDerivative',
                                description: 'This is useful for taking a running total metric and calculating the (positive) delta between subsequent data points. Same as the derivative function above, but ignores datapoints that trend down. Useful for counters that increase for a long time, then wrap or reset.',
                                example: 'nonNegativederivative(company.server.application01.ifconfig.TXPackets)',
                                argument: undefined,
                                template: 'nonNegativeDerivative($TARGET)'
                            }


                        ]
                        $scope.preview = preview;
                        $scope.index = index;
                        $scope.showPreview = false;

                        $scope.filterGraphiteFunctions = function(query) {

                            var results = query ? $scope.graphiteFunctions.filter( createFilterForGraphiteFunctions(query) ) : $scope.graphiteFunctions;

                            return results;

                        }

                        function createFilterForGraphiteFunctions(query) {
                            var upperCaseQuery = angular.uppercase(query);
                            return function filterFn(graphiteFunction) {
                                return (graphiteFunction.name.toUpperCase().indexOf(upperCaseQuery) !== -1  );
                            };
                        }

                        $scope.done = function($event){

                            $scope.metric.targets[$scope.index] = $scope.preview;
                            $mdDialog.cancel();
                        }

                        $scope.cancel = function($event){

                            $mdDialog.cancel();
                        }

                        $scope.wrap = function(graphiteFunction){

                            var targetRegExp = new RegExp('\\$TARGET', 'g');
                            var argumentRegExp = new RegExp('\\$ARGUMENT', 'g');
                            $scope.preview = (graphiteFunction.argument !== undefined) ? graphiteFunction.template.replace(targetRegExp, $scope.metric.targets[$scope.index]).replace(argumentRegExp, graphiteFunction.argument) : graphiteFunction.template.replace(targetRegExp, $scope.metric.targets[$scope.index]);
                            $scope.metric.targets[$scope.index] =  $scope.preview;
                        }

                        $scope.zoomOptions = [
                            {value: '-10min' , label: 'Last 10 minutes'},
                            {value: '-30min' , label: 'Last 30 minutes'},
                            {value: '-1h', label: 'Last hour'},
                            {value: '-3h', label: 'Last 3 hours'},
                            {value: '-6h', label: 'Last 6 hours'},
                            {value: '-12h', label: 'Last 12 hours'},
                            {value: '-1d', label: 'Last day'},
                            {value: '-2d', label: 'Last 2 days'},
                            {value: '-3d', label: 'Last 3 days'}
                        ];

                        $scope.zoomRange = Utils.zoomRangeTargetPreview;
                        /* set md-select selected item */
                        $scope.selectedZoomOptionIndex = $scope.zoomOptions.map(function(zoomOption){return zoomOption.label;}).indexOf($scope.zoomRange.label);


                        $scope.updatePreview = function (){

                            $scope.showPreview = false;

                            $scope.metric.targets[$scope.index] = $scope.preview;

                            $timeout(function(){

                                $scope.showPreview = true;


                            })
                        }
                        /* watch zoomRange */
                        $scope.$watch('zoomRange', function (newVal, oldVal) {


                            Utils.zoomRangeTargetPreview = $scope.zoomRange;

                        });



                    }




                }

            }



        }



    }
}
