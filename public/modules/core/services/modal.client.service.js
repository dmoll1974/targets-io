'use strict';

angular.module('core').factory('ConfirmModal', [
	function() {

		var ConfirmModal = {
			itemType: '',
			selectedItemId: '',
			selectedItemDescription: ''
		};

		return ConfirmModal;
	}
]);
