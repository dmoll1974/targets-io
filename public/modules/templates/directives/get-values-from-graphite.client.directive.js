'use strict';

angular.module('core').directive('getValuesFromGraphite', GetValuesFromGraphiteDirective);

function GetValuesFromGraphiteDirective () {

    var directive = {
        scope: {
            value: '=',
            query: '='

        },
        restrict: 'EA',
        templateUrl: 'modules/templates/directives/get-values-from-graphite.client.view.html',
        controller: GetValuesFromGraphiteDirectiveController,
        controllerAs: 'ctrlCreateGraphiteQuery'
    };

    return directive;

    /* @ngInject */
    function GetValuesFromGraphiteDirectiveController ($scope, $state, $timeout, Graphite) {


        $scope.validQuery = true;

        $scope.$watch('query', function() {

                /* get initial values for graphite target picker*/
            Graphite.findMetrics($scope.query).success(function(graphiteTargetsLeafs) {

                var graphiteTargets = [];

                if(graphiteTargetsLeafs.length === 0){

                    var queryErrorMessage = 'Variable query "' + $scope.query + '" did not return any results'
                    graphiteTargets.push({text: queryErrorMessage, id: ''});

                }else {

                    _.each(graphiteTargetsLeafs, function (graphiteTargetsLeaf) {
                        graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
                    });

                }

                $scope.defaultGraphiteTargets = graphiteTargets;
                $scope.graphiteTargets = $scope.defaultGraphiteTargets;

                console.log('query: ' + $scope.query);
            });
        });

        /* Open menu*/

        var originatorEv;
        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };


        $scope.setTarget = function(index) {

            Graphite.findMetrics($scope.graphiteTargets[index].text + '.*').success(function(graphiteTargetsLeafs) {

                /* if leafs are present, add wildcard '*' */
                if (graphiteTargetsLeafs.length > 0) {

                    $scope.validQuery = true;

                    /* if no leafs, show root query results*/
                } else {

                    $scope.validQuery = false;
                }

                $scope.value = $scope.graphiteTargets[index].text;

            });
        };

    }
}
