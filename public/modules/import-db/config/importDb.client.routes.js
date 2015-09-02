'use strict';

//Setting up route
angular.module('import-db').config(['$stateProvider',
	function($stateProvider) {
		// Graphs state routing
		$stateProvider.
		state('importDb', {
			url: '/import-db',
			templateUrl: 'modules/import-db/views/import-db.client.upload.html'
		})
		.state('importDbLegacy', {
			url: '/import-db-legacy',
			templateUrl: 'modules/import-db/views/import-db-legacy.client.upload.html'
		});
	}
]);
