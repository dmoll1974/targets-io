'use strict';

angular.module('metrics').directive('targetPreview', TargetPreviewDirective);

function TargetPreviewDirective () {

    var directive = {
        scope: {
            metric: '=',
            index: '='
        },
        restrict: 'EA',
        templateUrl: 'modules/metrics/directives/target-preview.client.view.html',
        controller: TargetPreviewDirectiveController,
        //controllerAs: 'ctrlTargetPreview'
    };

    return directive;

    /* @ngInject */
    function TargetPreviewDirectiveController ($scope, $state, $timeout, Graphite, $mdDialog) {



        $scope.showTargetPreview = function($event){

            //$scope.showTargetPreview = true;

            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                preserveScope : true,
                templateUrl: 'modules/metrics/views/target-preview-dialog.client.view.html',
                //scope: $scope,
                locals: {
                    metric: $scope.metric,
                    index: $scope.index
                },
                controller: DialogController
            });

            function DialogController($scope, $mdDialog, metric, Utils, index, Interval) {


                $scope.metric = metric;
                $scope.index = index;

                $scope.zoomOptions = [
                    {value: '-10min' , label: 'Last 10 minutes'},
                    {value: '-30min' , label: 'Last 30 minutes'},
                    {value: '-1h', label: 'Last hour'},
                    {value: '-3h', label: 'Last 3 hours'},
                    {value: '-6h', label: 'Last 6 hours'},
                    {value: '-12h', label: 'Last 12 hours'},
                    {value: '-1d', label: 'Last day'},
                    {value: '-2d', label: 'Last 2 days'},
                    {value: '-3d', label: 'Last 3 days'}
                ];

                $scope.zoomRange = Utils.zoomRangeTargetPreview;
                /* set md-select selected item */
                $scope.selectedZoomOptionIndex = $scope.zoomOptions.map(function(zoomOption){return zoomOption.label;}).indexOf($scope.zoomRange.label);

                $scope.cancel = function($event){

                    $scope.metric.annotations = undefined;
                    $scope.metric.graphNumberOfValidDatapoints = undefined;
                    $scope.metric.legendData = undefined;

                    $mdDialog.cancel();
                }

                /* watch zoomRange */
                $scope.$watch('zoomRange', function (newVal, oldVal) {


                    Utils.zoomRangeTargetPreview = $scope.zoomRange;

                });


            }



        }



    }
}
