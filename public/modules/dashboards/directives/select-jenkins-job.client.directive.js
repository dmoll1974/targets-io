'use strict';

angular.module('dashboards' +
    '').directive('selectJenkinsJob', SelectJenkinsJobDirective);

function SelectJenkinsJobDirective () {

    var directive = {
        scope: {
            job: '=',
        },
        restrict: 'EA',
        templateUrl: 'modules/dashboards/directives/select-jenkins-job.client.view.html',
        controller: SelectJenkinsJobDirectiveController
    };

    return directive;

    /* @ngInject */
    function SelectJenkinsJobDirectiveController ($scope, $state, $timeout, Graphite, $mdDialog, Utils) {


        $scope.showTargetAutocompleteDialog = showTargetAutocompleteDialog;

            function showTargetAutocompleteDialog($event) {

            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                preserveScope: true,
                templateUrl: 'modules/dashboards/views/select-jenkins-job.dialog.client.view.html',
                scope: $scope,
                //locals: {
                //    jenkinsJobs: $scope.metric.targets[$scope.index],
                //    index: $scope.index
                //},
                onComplete: function () {
                    setTimeout(function () {
                        document.querySelector('#jenkinsJobAutoComplete').focus();
                    }, 1);
                },
                controller: DialogController
            });

            function DialogController($scope, $mdDialog, Jenkins, $stateParams) {

                Jenkins.getJobs($stateParams.productName).success(function (jenkinJobs) {

                    $scope.jenkinJobs = jenkinJobs.body.jobs;

                })

                $scope.filterJenkinsJobs = function (query) {

                    var results = query ? $scope.jenkinJobs.filter(createFilterForJenkinsJobs(query)) : $scope.jenkinJobs;

                    return results;

                }

                $scope.selectJenkinsJob = function (jenkinsJob) {

                    $scope.job = jenkinsJob.name;
                    $mdDialog.hide();
                }

                function createFilterForJenkinsJobs(query) {
                    var upperCaseQuery = angular.uppercase(query);
                    return function filterFn(jenkinsJob) {
                        return (jenkinsJob.name.toUpperCase().indexOf(upperCaseQuery) !== -1 );
                    };
                }

                $scope.cancel = function ($event) {


                    $mdDialog.cancel();
                }


            }

        }
    }
}

