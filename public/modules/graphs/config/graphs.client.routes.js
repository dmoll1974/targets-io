'use strict';

//Setting up route
angular.module('graphs').config(['ngClipProvider', function(ngClipProvider) {
		ngClipProvider.setPath("lib/zeroclipboard/dist/ZeroClipboard.swf");

	}]).config(['$stateProvider',
		function($stateProvider) {
		// Graphs state routing
		$stateProvider.
		state('viewGraphs', {
			url: '/graphs/:productName/:dashboardName/:testRunId/:tag',
			templateUrl: 'modules/graphs/views/graphs.client.view.html'
		}).
		state('deepLinkGraph', {
			url: '/graphs/:productName/:dashboardName/:testRunId/:tag/:metricId?zoomFrom&zoomUntil',
			templateUrl: 'modules/graphs/views/graphs.client.view.html'
		}).
		state('viewLiveGraphs', {
			url: '/graphs-live/:productName/:dashboardName/:tag',
			templateUrl: 'modules/graphs/views/graphs-live.client.view.html'
		}).
        	state('deepLinkLiveGraph', {
            url: '/graphs-live/:productName/:dashboardName/:tag/:metricId?zoomFrom&zoomUntil',
            templateUrl: 'modules/graphs/views/graphs-live.client.view.html'
        });
	}
]);
