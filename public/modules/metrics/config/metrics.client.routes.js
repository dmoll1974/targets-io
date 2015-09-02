'use strict';

//Setting up route
angular.module('metrics').config(['$stateProvider',
	function($stateProvider) {
		// Metrics state routing
		$stateProvider.
		state('listMetrics', {
			url: '/metrics/:dashboardId',
			templateUrl: 'modules/metrics/views/list-metrics.client.view.html'
		}).
		state('createMetric', {
			url: '/add/metric/:productName/:dashboardName',
			templateUrl: 'modules/metrics/views/create-metric.client.view.html'
		}).
//		state('viewMetric', {
//			url: '/browse/:productName/:dashboardName/:metricId',
//			templateUrl: 'modules/metrics/views/view-metric.client.view.html'
//		}).
		state('editMetric', {
			url: '/edit/metric/:productName/:dashboardName/:metricId',
			templateUrl: 'modules/metrics/views/edit-metric.client.view.html'
		});
	}
]);