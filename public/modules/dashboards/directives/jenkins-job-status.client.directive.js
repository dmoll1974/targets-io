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
    function JenkinsJobStatusDirectiveController ($scope, $state, $stateParams, $timeout, Graphite, $mdDialog, $mdToast, Jenkins, Utils, $interval, Products, $window, $rootScope, AuthenticationService) {




        $scope.$on('$destroy', function () {
          // Make sure that the interval is destroyed too
          $interval.cancel(Utils.polling);

        });

        var jenkinsJobStatusPolling = function ($event) {

            loginDialog($event, function (){

                Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function (status) {

                $scope.jenkinsJobQueueWhy = status.inQueue ? status.queueItem.why : '';

                $scope.jenkinsJobStatus = status.inQueue ? 'Queued' : (status.builds[0])? (status.builds[0].building) ? 'Running' : 'Stopped' : 'Never built before';

                })
            })

        }

        jenkinsJobStatusPolling();

        Utils.polling = $interval(jenkinsJobStatusPolling, 15000);

        $scope.startJob = function($event){


            loginDialog($event, function (){

                Jenkins.startJob($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(){

                    Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(status){

                        $scope.jenkinsJobQueueWhy = status.inQueue ? status.queueItem.why : '';

                        $scope.jenkinsJobStatus = status.inQueue ? 'Queued': (status.builds[0].building)? 'Running': 'Stopped'

                        var content = 'Job has been started';
                        var toast = $mdToast.simple()
                            .action('OK')
                            .highlightAction(true)
                            .position('top center')
                            .hideDelay(3000);

                        $mdToast.show(toast.content(content)).then(function(response) {});

                    })


                });

             })


        }

        $scope.stopJob = function($event){

            loginDialog($event, function (){

                Jenkins.stopJob($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(){

                    Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(status){

                        $scope.jenkinsJobQueueWhy = status.inQueue ? status.queueItem.why : '';

                        $scope.jenkinsJobStatus = status.inQueue ? 'Queued': (status.builds[0].building)? 'Running': 'Stopped';

                        var content = 'Job has been stopped';
                        var toast = $mdToast.simple()
                            .action('OK')
                            .highlightAction(true)
                            .position('top center')
                            .hideDelay(3000);

                        $mdToast.show(toast.content(content)).then(function(response) {});

                    })


                });
            });
        }

        $scope.jenkinsJobConfig = function (url) {

            Products.get($stateParams.productName).success(function (product) {

                var url = product.jenkinsHost + '/job/' + $scope.dashboard.jenkinsJobName + '/configure';
                $window.open(url, '_blank');
            });

        };

        $scope.jenkinsJobConsole = function($event){


            Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(status){

                Products.get($stateParams.productName).success(function (product) {

                    var url = product.jenkinsHost + '/job/' + $scope.dashboard.jenkinsJobName + '/' + status.builds[0].number +'/console';
                    $window.open(url, '_blank');

                });
            })

        }

        function loginDialog($event, callback) {

            /* if not already set, show dialog to get user and password */

            if (!$rootScope.globals || !$rootScope.globals.currentUser) {

                var parentEl = angular.element(document.body);
                $mdDialog.show({
                    parent: parentEl,
                    targetEvent: $event,
                    preserveScope: true,
                    templateUrl: 'modules/dashboards/views/jenkins-credentials.dialog.client.view.html',
                    scope: $scope,
                    //locals: {
                    //    jenkinsJobs: $scope.metric.targets[$scope.index],
                    //    index: $scope.index
                    //},
                    onComplete: function () {
                        setTimeout(function () {
                            //document.querySelector('#jenkinsJobAutoComplete').focus();
                        }, 1);
                    },
                    controller: DialogController
                });

                function DialogController($scope, $mdDialog, Jenkins, $stateParams) {


                    $scope.cancel = function ($event) {

                        $mdDialog.cancel();
                    }




                    $scope.login = function () {

                        AuthenticationService.SetCredentials($scope.user, $scope.password);
                        callback();
                        $mdDialog.hide();
                    }
                }

            }else{

                callback();
            }
        }
    }
}

