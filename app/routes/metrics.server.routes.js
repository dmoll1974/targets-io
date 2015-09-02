'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var metrics = require('../../app/controllers/metrics.server.controller');

	// Metrics Routes
	app.route('/metrics')
		.get(metrics.list)
		.post(metrics.create); //users.requiresLogin,

	app.route('/metrics/:metricId')
		.get(metrics.read)
		.put(   metrics.update) //users.requiresLogin, metrics.hasAuthorization,
		.delete( metrics.delete); //users.requiresLogin, metrics.hasAuthorization,

	// Finish by binding the Metric middleware
	app.param('metricId', metrics.metricByID);
};
