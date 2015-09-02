'use strict';

//Setting up route
angular.module('dashboards').config(['$stateProvider',
	function($stateProvider) {
		// Dashboards state routing
		$stateProvider.
		state('listDashboards', {
			url: ':/dashboards',
			templateUrl: 'modules/dashboards/views/list-dashboards.client.view.html'
		}).
		state('createDashboard', {
			url: '/add/dashboard/:productName',
			templateUrl: 'modules/dashboards/views/create-dashboard.client.view.html'
		}).
		state('viewDashboard', {
			url: '/browse/:productName/:dashboardName',
			templateUrl: 'modules/dashboards/views/view-dashboard.client.view.html'
		}).
		state('editDashboard', {
			url: '/edit/dashboard/:productName/:dashboardName',
			templateUrl: 'modules/dashboards/views/edit-dashboard.client.view.html'
		});

	}
]);
