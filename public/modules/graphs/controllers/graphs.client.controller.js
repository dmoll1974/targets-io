'use strict';

angular.module('graphs').controller('GraphsController', ['$scope', '$modal', '$rootScope', '$state', '$stateParams', 'Dashboards','Graphite','TestRuns', 'Metrics','$log', 'Tags', 'ConfirmModal',
	function($scope, $modal, $rootScope, $state, $stateParams, Dashboards, Graphite, TestRuns, Metrics, $log, Tags, ConfirmModal) {


         $scope.gatlingDetails = ($stateParams.tag === 'Gatling') ? true : false;
            /* Get deeplink zoom params from query string */

         if($state.params.zoomFrom) TestRuns.zoomFrom = $state.params.zoomFrom;

         if($state.params.zoomUntil) TestRuns.zoomUntil = $state.params.zoomUntil;


         //$scope.value = $stateParams.tag;

        /* reset zoom*/
        $scope.resetZoom = function(){

                /*reset zoom*/
                TestRuns.zoomFrom = "";
                TestRuns.zoomUntil = "";

                $state.go($state.current, {}, {reload: true});

        }

        /* Zoom lock enabled by default */
        $scope.zoomLock = true;

        $scope.init = function(){

                Dashboards.get($stateParams.productName, $stateParams.dashboardName).then(function (dashboard){


                        $scope.dashboard = Dashboards.selected;

                        $scope.metrics = addAccordionState(Dashboards.selected.metrics);

                        /* Get tags used in metrics */
                        $scope.tags = Tags.setTags($scope.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);

                        /* if reloading a non-existing tag is in $statParams */
                        $scope.value = (checkIfTagExists($stateParams.tag)) ? $stateParams.tag : 'All';

                        if($stateParams.testRunId) {

                                TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {

                                        TestRuns.selected = testRun;

                                });

                        }
                });

        };

        function checkIfTagExists (tag) {

                var exists = false;

                _.each($scope.tags, function(existingTag){

                        if(tag === existingTag.text){
                                exists = true;
                                return;
                        }

                })

                return exists;

        }
        function addAccordionState(metrics){

                _.each(metrics, function(metric){

                        metric.isOpen = false;
                })

                return metrics;
        }
        /* default zoom range for live graphs is -10m */
        $scope.zoomRange = (TestRuns.zoomRange !== '')? TestRuns.zoomRange : '-10min';

        /* Set active tab */
        $scope.isActive = function (tag){

           return  $scope.value === tag;
        };


        $scope.editMetric = function(metricId){

                $state.go('editMetric', {productName: $stateParams.productName, dashboardName: $stateParams.dashboardName, metricId: metricId});
        }


        $scope.loadTags = function(query){

            var matchedTags = [];

            _.each(Dashboards.selected.tags, function(tag){

                    if(tag.text.toLowerCase().match(query.toLowerCase()))
                            matchedTags.push(tag);
            });

            return matchedTags;

       };

        function updateFilterTags  (filterTags, filterOperator, persistTag) {


            var combinedTag;
            var newTags = [];

            _.each(filterTags, function (filterTag, index) {

                switch (index) {

                    case 0:
                        combinedTag = filterTag.text + filterOperator;
                        break;
                    case filterTags.length - 1:
                        combinedTag += filterTag.text;
                        break;
                    default:
                        combinedTag += filterTag.text + filterOperator;


                }

            })

            newTags.push({text: combinedTag})

            /* if persist tag is checked, update dashboard tags*/
            if (persistTag) {
                if (Dashboards.updateTags(newTags)) {

                    Dashboards.update().success(function (dashboard) {

                        $scope.dashboard = Dashboards.selected;
                        /* Get tags used in metrics */
                        $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);

                    });

                }
            }

            return newTags;


        }

    $scope.removeTag = function(removeTag)    {

        var updatedTags = [];

        _.each(Dashboards.selected.tags, function(tag){

            if(tag !== removeTag) updatedTags.push({text: tag.text});
        })

        Dashboards.selected.tags = updatedTags;
        Dashboards.update().success(function(dashboard){});

    }

    $scope.openTagsFilterModal = function (size) {

        var modalInstance = $modal.open({
            templateUrl: 'tagFilterModal.html',
            controller: 'TagFilterModalInstanceController',
            size: size

        });

        modalInstance.result.then(function (data) {

            var newTag = updateFilterTags(data.filterTags, data.filterOperator, data.persistTag);

            /* Get tags used in metrics */
            $scope.tags = Tags.setTags($scope.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
            /* add new tag */
            $scope.tags.push({text: newTag[0].text, route: {productName: $stateParams.productName, dashboardName: $stateParams.dashBoardName, tag: newTag, testRunId: $stateParams.testRunId}});

            $scope.value = newTag[0].text;


        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    }
]);
