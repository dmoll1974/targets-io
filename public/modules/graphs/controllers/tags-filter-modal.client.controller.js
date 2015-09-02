'use strict';

angular.module('graphs').controller('TagFilterModalInstanceController', ['$scope', '$modalInstance','ConfirmModal', 'Dashboards',
	function($scope, $modalInstance, ConfirmModal, Dashboards) {

		$scope.filterOperatorOptions =
			[
				{
				label: " AND ",
				value: " AND "
				}, {
				label: " OR ",
				value: " OR "
				}
			]



		$scope.persistTag = false;

		$scope.loadTags = function(query){

			var matchedTags = [];

			_.each(Dashboards.selected.tags, function(tag){

				if(tag.text.toLowerCase().match(query.toLowerCase()))
					matchedTags.push(tag);
			});

			return matchedTags;

		};



		$scope.ok = function () {

			var data = {};
			data.filterOperator = $scope.filterOperator.value;
			data.persistTag = $scope.persistTag;
			data.filterTags = $scope.filterTags;

			$modalInstance.close(data);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

	}
]);
