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

        $scope.recentTestPeriod = 1;

        $scope.$watch(function () {
            $scope.filteredRecentTestRuns = $scope.$eval("recentTests | filter:testRunFilter");
        });

        $scope.clearTestRunFilter = function(){

            $scope.testRunFilter = '';

        };

        $scope.recentTestPeriodOptions = [
            {value: 1 , label: 'Last day'},
            {value: 2, label: 'Last 2 days'},
            {value: 3, label: 'Last 3 days'},
            {value: 7, label: 'Last week'}
        ];

        var pollRecentTests = function(){
            TestRuns.getRecentTestruns($scope.recentTestPeriod).success(function(recentTests){

                $scope.recentTests = recentTests;

            });
        };

        pollRecentTests();
        var polling = $interval(pollRecentTests, 60 * 1000); // poll every minute


        $scope.updaterecentTestRuns = function(){

            pollRecentTests();
        }

        $scope.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $interval.cancel(polling);
        });

    }
}
