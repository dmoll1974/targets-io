'use strict';

// Metrics controller
angular.module('metrics').controller('MetricsController', ['$scope', '$modal', '$log', '$rootScope', '$stateParams', '$state', '$location', 'Authentication', 'Metrics','Dashboards', 'ConfirmModal',
	function($scope, $modal, $log, $rootScope, $stateParams, $state, $location, Authentication, Metrics, Dashboards, ConfirmModal) {
		$scope.authentication = Authentication;

        $scope.productName = $stateParams.productName;

        $scope.dashboardName = $stateParams.dashboardName;

        /* values for form drop downs*/
        $scope.metricTypes = ['Average', 'Maximum', 'Minimum', 'Last', 'Slope'];

        $scope.operatorOptions = [{alias: 'lower than', value: '<'}, {alias: 'higher than', value: '>'}];

        $scope.deviationOptions = [{alias: 'negative deviation', value: '<'}, {alias: 'positive deviation', value: '>'}, {alias: '', value: ''}];

        $scope.targets = [''];

        $scope.metric = {};

        $scope.metric.dashboardId = Dashboards.selected._id;

        $scope.metric.targets = [''];

        $scope.enableBenchmarking = 'disabled';

        $scope.enableRequirement ='disabled';
        
        $scope.percentageOptions = [
            {alias: '10%', value: '0.1'},
            {alias: '25%', value: '0.25'},
            {alias: '50%', value: '0.5'},
            {alias: '100%', value: '1.00'},
            {alias: '200%', value: '2.00'},
            {alias: '300%', value: '3.00'},
            {alias: '400%', value: '4.00'},
            {alias: '500%', value: '5.00'},
        ];

        $scope.$watch('enableRequirement', function (newVal, oldVal) {

            if (newVal !== oldVal) {

                if($scope.enableRequirement === 'disabled'){

                    $scope.metric.requirementOperator = null;
                    $scope.metric.requirementValue = null;

                }
            }
        });

        $scope.addTarget = function() {

            $scope.metric.targets.push('');

        };

        $scope.removeTarget = function(index) {

            $scope.metric.targets.splice(index, 1);

        };

        $scope.loadTags = function(query){

            var matchedTags = [];

            _.each(Dashboards.selected.tags, function(tag){

                if(tag.text.toLowerCase().match(query.toLowerCase()))
                    matchedTags.push(tag);
            });

                return matchedTags;

        };

        $scope.initCreateForm = function () {
            
           if (Metrics.clone.alias ) $scope.metric = Metrics.clone;
        };

        // Create new Metric
		$scope.create = function() {

            /* Update tags in Dashboard if any new are added */

            if(Dashboards.updateTags($scope.metric.tags)) Dashboards.update().success(function(dashboard){});

            $scope.metric.productName = $stateParams.productName;
            $scope.metric.dashboardName = $stateParams.dashboardName;

            Metrics.create($scope.metric).success(function (metric) {

            /* reset cloned metric */
                Metrics.clone = {};
                
                $location.path('browse/' + $stateParams.productName + '/' + $stateParams.dashboardName);
            });

        };
        
		// Remove existing Metric
		$scope.remove = function(metric) {
			if ( metric ) { 
				metric.$remove();

				for (var i in $scope.metrics) {
					if ($scope.metrics [i] === metric) {
						$scope.metrics.splice(i, 1);
					}
				}
			} else {
				$scope.metric.$remove(function() {
					$location.path('metrics');
				});
			}
		};

		// Update existing Metric
		$scope.update = function() {

            /* Update tags in Dashboard if any new are added */

            if(Dashboards.updateTags($scope.metric.tags)) Dashboards.update().success(function(dashboard){});

            $scope.metric.productName = $stateParams.productName;
            $scope.metric.dashboardName = $stateParams.dashboardName;

            Metrics.update($scope.metric).success(function (metric) {

                if ($rootScope.previousStateParams)
                    $state.go($rootScope.previousState,$rootScope.previousStateParams);
                else
                    $state.go($rootScope.previousState);
            });
		};

		// Find a list of Metrics
		$scope.find = function() {
			$scope.metrics = Metrics.query();
		};

		// Find existing Metric
		$scope.findOne = function() {

            Metrics.get($stateParams.metricId).success(function(metric){

                $scope.metric = metric;

                /* set benchmark and requirement toggles */

                if($scope.metric.requirementValue)
                    $scope.enableRequirement ='enabled';

                if($scope.metric.benchmarkValue)
                    $scope.enableBenchmarking = 'enabled';




            });
		};

       $scope.clone = function() {
           
           $scope.metric._id = undefined;

           Metrics.clone = $scope.metric;

           $state.go('createMetric',{"productName":$stateParams.productName, "dashboardName":$stateParams.dashboardName});
           
       } 
       $scope.cancel = function() {
           
          if ($rootScope.previousStateParams)
              $state.go($rootScope.previousState,$rootScope.previousStateParams);
          else
              $state.go($rootScope.previousState);



       }
        $scope.openDeleteConfirmation = function (size, index) {

            Metrics.selected = $scope.metric;

            ConfirmModal.itemType = 'Delete metric ';
            ConfirmModal.selectedItemId = $scope.metric._id;
            ConfirmModal.selectedItemDescription = $scope.metric.alias;

            var modalInstance = $modal.open({
                templateUrl: 'ConfirmDelete.html',
                controller: 'ModalInstanceController',
                size: size//,
            });

            modalInstance.result.then(function (metricId) {

                Metrics.delete(metricId).success(function(metric){

                    /* refresh dashboard*/
                    Dashboards.get($scope.productName, $scope.dashboardName).success(function(dashboard){

                        $scope.dashboard = Dashboards.selected;
                        
                        /* return to previuos state*/
                        $state.go($rootScope.previousState,$rootScope.previousStateParams);

                    });

                });

            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };


    }
]);
