'use strict';

angular.module('dashboards' +
    '').directive('jenkinsJobStatus', JenkinsJobStatusDirective);

function JenkinsJobStatusDirective () {

    var directive = {
        scope: {
            dashboard: '=',
        },
        restrict: 'EA',
        templateUrl: 'modules/dashboards/directives/jenkins-job-status.client.view.html',
        controller: JenkinsJobStatusDirectiveController
    };

    return directive;

    /* @ngInject */
    function JenkinsJobStatusDirectiveController ($scope, $state, $stateParams, $timeout, Graphite, $mdDialog, Jenkins, Utils, $interval, Products, $window) {




        $scope.$on('$destroy', function () {
          // Make sure that the interval is destroyed too
          $interval.cancel(Utils.polling);

        });

        var jenkinsJobStatusPolling = function () {
            Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function (status) {

                $scope.jenkinsJobQueueWhy = status.inQueue ? status.queueItem.why : '';

                $scope.jenkinsJobStatus = status.inQueue ? 'Queued' : (status.builds[0])? (status.builds[0].building) ? 'Running' : 'Stopped' : 'Never built before';

            })
        }

        jenkinsJobStatusPolling();

        Utils.polling = $interval(jenkinsJobStatusPolling, 15000);

        $scope.startJob = function(){

            Jenkins.startJob($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(){

                Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(status){

                    $scope.jenkinsJobQueueWhy = status.inQueue ? status.queueItem.why : '';

                    $scope.jenkinsJobStatus = status.inQueue ? 'Queued': (status.builds[0].building)? 'Running': 'Stopped'

                })


            });
        }

        $scope.stopJob = function(){

            Jenkins.stopJob($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(){

                Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(status){

                    $scope.jenkinsJobQueueWhy = status.inQueue ? status.queueItem.why : '';

                    $scope.jenkinsJobStatus = status.inQueue ? 'Queued': (status.builds[0].building)? 'Running': 'Stopped'

                })


            });
        }

        $scope.jenkinsJobConfig = function (url) {

            Products.get($stateParams.productName).success(function (product) {

                var url = product.jenkinsHost + '/job/' + $scope.dashboard.jenkinsJobName + '/configure';
                $window.open(url, '_blank');
            });

        };

        $scope.jenkinsJobConsole = function(){

            Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(status){

                Products.get($stateParams.productName).success(function (product) {

                    var url = product.jenkinsHost + '/job/' + $scope.dashboard.jenkinsJobName + '/' + status.builds[0].number +'/console';
                    $window.open(url, '_blank');

                });
            })

        }

    }
}

