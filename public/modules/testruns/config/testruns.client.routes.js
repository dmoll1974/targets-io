'use strict';

//Setting up route
angular.module('testruns').config(['$stateProvider',
	function($stateProvider) {
		// Testruns state routing
		$stateProvider.
		state('viewTestruns', {
			url: '/testruns/:productName/:dashboardName',
			templateUrl: 'modules/testruns/views/testruns.client.view.html'
		}).
		state('requirementsTestRun', {
			url: '/requirements/:productName/:dashboardName/:testRunId/:requirementsResult',
			templateUrl: 'modules/graphs/views/requirements.client.view.html'
		});
	}
]);
