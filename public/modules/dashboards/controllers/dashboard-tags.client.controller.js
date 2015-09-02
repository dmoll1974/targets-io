'use strict';

angular.module('dashboards').controller('DashboardTagsController', ['$scope', 'Dashboards', '$modal', 'Metrics', 'ConfirmModal',
	function($scope, Dashboards, $modal, Metrics, ConfirmModal	) {


		$scope.tags = Dashboards.selected.tags;

		$scope.defaultTag = Dashboards.defaultTag;

		$scope.$watch(function(scope) { return Dashboards.selected },
			function(newVal, oldVal) {

				if (newVal !== oldVal) {

					$scope.tags = Dashboards.selected.tags;

					$scope.defaultTag = Dashboards.getDefaultTag(Dashboards.selected.tags);

					setDefault($scope.defaultTag);

					Dashboards.update().success(function(dashboard){

						$scope.tags = dashboard.tags;
					})
				}
			}
		);

		$scope.$watch('defaultTag', function (newVal, oldVal) {

			if (newVal !== oldVal) {

				setDefault($scope.defaultTag);

				Dashboards.update().success(function(dashboard){

					Dashboards.selected = dashboard;

					$scope.tags = Dashboards.selected.tags;


				})
			}
		});

		function setDefault(newDefaultTag) {

			_.each(Dashboards.selected.tags, function(tag, i){

				if(tag.text === newDefaultTag){
					Dashboards.selected.tags[i].default = true;
				}else{
					Dashboards.selected.tags[i].default = false;
				}
			})
		}


	$scope.openDeleteTagModal = function (size, index) {

		ConfirmModal.itemType = 'Delete tag ';
		ConfirmModal.selectedItemId = index;
		ConfirmModal.selectedItemDescription = Dashboards.selected.tags[index].text;

		var modalInstance = $modal.open({
			templateUrl: 'ConfirmDelete.html',
			controller: 'ModalInstanceController',
			size: size//,
		});


		modalInstance.result.then(function (index) {

			var selectedTagsText = ConfirmModal.selectedItemDescription;

			Dashboards.selected.tags.splice(index,1);

			Dashboards.update().success(function(dashboard){

				$scope.tags = dashboard.tags;

				_.each(Dashboards.selected.metrics, function (metric){

					Metrics.removeTag(metric._id, selectedTagsText);

				})
			});


		}, function () {
			//$log.info('Modal dismissed at: ' + new Date());
		});
	};

}
]);
