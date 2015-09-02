'use strict';

//Setting up route
angular.module('events').config(['$stateProvider',
	function($stateProvider) {
		// Events state routing
		$stateProvider.
		state('listEvents', {
			url: '/events',
			templateUrl: 'modules/events/views/list-events-dashboard.client.view.html'
		}).
		state('createEvent', {
			url: '/create/event/:productName/:dashboardName',
			templateUrl: 'modules/events/views/create-event.client.view.html'
		}).
		state('viewEvent', {
			url: '/events/:eventId',
			templateUrl: 'modules/events/views/view-event.client.view.html'
		}).
		state('editEvent', {
			url: '/edit/event/:productName/:dashboardName/:eventId',
			templateUrl: 'modules/events/views/edit-event.client.view.html'
		});
	}
]);
