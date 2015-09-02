'use strict';

angular.module('core').controller('ModalInstanceController', ['$scope', '$modalInstance','ConfirmModal',
	function($scope, $modalInstance, ConfirmModal) {

		$scope.itemType = ConfirmModal.itemType;
		$scope.selectedItemId = ConfirmModal.selectedItemId;
		$scope.selectedItemDescription = ConfirmModal.selectedItemDescription;

		$scope.ok = function () {
			$modalInstance.close($scope.selectedItemId);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

	}
]);
