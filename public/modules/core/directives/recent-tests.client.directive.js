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

        /* get recentTestPeriod  */
        $scope.recentTestPeriod = Utils.recentTestPeriod;

        /* watch zoomRange */
        $scope.$watch('recentTestPeriod', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                Utils.recentTestPeriod = $scope.recentTestPeriod;
            }
        });


        $scope.recentTestPeriodOptions = [
            {value: '-10min' , label: 'Last day'},
            {value: '-2d', label: 'Last 2 days'},
            {value: '-3d', label: 'Last 3 days'},
            {value: '-3d', label: 'Last week'}
        ];

        var pollRecentTests = function(){
            TestRuns.getRecentTestruns($scope.recentTestPeriod).success(function(recentTests){

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
