'use strict';

// Configuring the Articles module
angular.module('metrics').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Metrics', 'metrics', 'dropdown', '/metrics(/create)?');
		Menus.addSubMenuItem('topbar', 'metrics', 'List Metrics', 'metrics');
		Menus.addSubMenuItem('topbar', 'metrics', 'New Metric', 'metrics/create');
	}
]);

