'use strict';

angular.module('metrics').directive('createGraphiteQuery', CreateGraphiteQueryDirective);

function CreateGraphiteQueryDirective () {

    var directive = {
        scope: {
            target: '=',
            index: '='
        },
        restrict: 'EA',
        templateUrl: 'modules/metrics/directives/create-graphite-query.client.view.html',
        controller: CreateGraphiteQueryDirectiveController,
        controllerAs: 'ctrlCreateGraphiteQuery'
    };

    return directive;

    /* @ngInject */
    function CreateGraphiteQueryDirectiveController ($scope, $state, $timeout, Graphite, $mdDialog) {



        $scope.showTargetAutocompleteDialog = function($event){

            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                preserveScope : true,
                templateUrl: 'modules/metrics/views/create-graphite-query-dialog.client.view.html',
                scope: $scope,
                locals: {
                    selectedTarget: $scope.target,
                    index: $scope.index
                },
                onComplete: function () {
                    setTimeout(function(){
                        document.querySelector('#targetAutoComplete').focus();
                    },1);
                },
                controller: DialogController
            });

            function DialogController($scope, $mdDialog, selectedTarget, index) {

                $scope.selectedTarget = selectedTarget;
                $scope.index = index;

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

                                    $scope.target = $scope.selectedTarget;
                                    $mdDialog.cancel();

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

                                    $scope.target = $scope.selectedTarget;
                                    $mdDialog.cancel();

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

                    $scope.target = $scope.selectedTarget;
                    $mdDialog.cancel();
                }

                $scope.cancel = function($event){

                    $mdDialog.cancel();
                }

                $scope.revert = function(){

                    $scope.selectedTarget = $scope.selectedTarget.match(/(.*)\..*\.\*$/) !== null ? $scope.selectedTarget.match(/(.*)\..*\.\*$/)[1] : '' ;

                    /* remove trailing '.*' if there*/
                    $scope.selectedTarget =  $scope.selectedTarget.indexOf('.*') !== -1 ? $scope.selectedTarget.substring(0,$scope.selectedTarget.indexOf('.*')) : $scope.selectedTarget;

                    //updateTargets ($scope.selectedTarget, $scope.selectedTarget);

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



            }



        }



    }
}
