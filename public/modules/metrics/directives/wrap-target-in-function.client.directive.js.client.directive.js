'use strict';

angular.module('metrics').directive('wrapTargetInFunction', WrapTargetInFunctionDirective);

function WrapTargetInFunctionDirective () {

    var directive = {
        scope: {
            target: '=',
            index: '='
        },
        restrict: 'EA',
        templateUrl: 'modules/metrics/directives/wrap-target-in-function.client.view.html',
        controller: WrapTargetInFunctionDirectiveController,
        //controllerAs: 'ctrlWrapTargetInFunction'
    };

    return directive;

    /* @ngInject */
    function WrapTargetInFunctionDirectiveController ($scope, $state, $timeout, Graphite, $mdDialog) {



        $scope.showWrapTargetInFunctionDialog = function($event){

            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                preserveScope : true,
                templateUrl: 'modules/metrics/views/wrap-target-in-function-dialog.client.view.html',
                scope: $scope,
                locals: {
                    preview: $scope.target,
                    index: $scope.index
                },
                onComplete: function () {
                    setTimeout(function(){
                        document.querySelector('#graphiteFunctionAutoComplete').focus();
                    },1);
                },
                controller: DialogController
            });

            function DialogController($scope, $mdDialog, preview, index) {

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

                ]
                $scope.preview = preview;
                $scope.index = index;

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

                    $scope.target = $scope.preview;
                    $mdDialog.cancel();
                }

                $scope.cancel = function($event){

                    $mdDialog.cancel();
                }

                $scope.wrap = function(graphiteFunction){

                    var targetRegExp = new RegExp('\\$TARGET', 'g');
                    var argumentRegExp = new RegExp('\\$ARGUMENT', 'g');
                    $scope.preview = (graphiteFunction.argument !== undefined) ? graphiteFunction.template.replace(targetRegExp, $scope.target).replace(argumentRegExp, graphiteFunction.argument) : graphiteFunction.template.replace(targetRegExp, $scope.target);
                    $scope.target =  $scope.preview;
                }




            }



        }



    }
}
