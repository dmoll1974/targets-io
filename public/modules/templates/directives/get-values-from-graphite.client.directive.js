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
        $scope.showTargetAutocomplete = false;



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

        $scope.toggleShowTargetAutocomplete = function(){

            $scope.showTargetAutocomplete = true;

            setTimeout(function(){
                document.querySelector('#mergeTemplateAutoComplete').focus();
            },10);
        }

        $scope.filterGraphiteTargets = function(query) {

            var results = query ? $scope.graphiteTargets.filter( createFilterForTemplates(query) ) : $scope.graphiteTargets;

            return results;

        }

        function createFilterForTemplates(query) {
            var upperCaseQuery = angular.uppercase(query);
            return function filterFn(graphiteTarget) {
                return (graphiteTarget.text.toUpperCase().indexOf(upperCaseQuery) !== -1  );
            };
        }


        $scope.setTarget = function(target) {

            Graphite.findMetrics(target.text + '.*').success(function(graphiteTargetsLeafs) {

                /* if leafs are present, add wildcard '*' */
                if (graphiteTargetsLeafs.length > 0) {

                    $scope.validQuery = true;

                    /* if no leafs, show root query results*/
                } else {

                    $scope.validQuery = false;
                }

                $scope.value = target.text;
                $scope.showTargetAutocomplete = false;


            });
        };

    }
}
