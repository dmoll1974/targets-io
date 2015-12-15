'use strict';

angular.module('core').directive('runningTests', RunningTestsDirective);

function RunningTestsDirective () {

    var directive = {

        restrict: 'EA',
        templateUrl: 'modules/core/directives/running-tests.client.view.html',
        controller: RunningTestsDirectiveController
    };

    return directive;

    /* @ngInject */
    function RunningTestsDirectiveController ($scope, $state, $interval, RunningTests, TestRuns) {

        var pollRunningTests = function(){
            RunningTests.get().success(function(runningTests){

                $scope.runningTests = runningTests;

                /* calculate duration */

                _.each($scope.runningTests, function(testRun, i){

                    $scope.runningTests[i].duration = TestRuns.calculateDuration(testRun);
                })


            });
        };

        pollRunningTests();
        var polling = $interval(pollRunningTests, 30 * 1000); // poll every 30 seconds



        $scope.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $interval.cancel(polling);
        });

    }
}
