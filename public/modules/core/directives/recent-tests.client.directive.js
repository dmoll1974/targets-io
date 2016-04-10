'use strict';

angular.module('core').directive('recentTests', RecentTestsDirective);

function RecentTestsDirective () {

    var directive = {

        restrict: 'EA',
        templateUrl: 'modules/core/directives/recent-tests.client.view.html',
        controller: RecentTestsDirectiveController
    };

    return directive;

    /* @ngInject */
    function RecentTestsDirectiveController ($scope, $state, $interval, TestRuns) {

        $scope.completedTestRunsOnly = true;

        var pollRecentTests = function(){
            TestRuns.getRecentTestruns().success(function(recentTests){

                $scope.recentTests = recentTests;

            });
        };

        pollRecentTests();
        var polling = $interval(pollRecentTests, 60 * 1000); // poll every minute



        $scope.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $interval.cancel(polling);
        });

    }
}
