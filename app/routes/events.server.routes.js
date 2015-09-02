'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var events = require('../../app/controllers/events.server.controller');

	// Events Routes
	app.route('/events')
		.get(events.list)
		.post(events.create)

//    app.route('/events-product/:productName')
//        .get(events.eventsForProduct)

    app.route('/events-dashboard/:productName/:dashboardName')
        .get(events.eventsForDashboard)

	app.route('/events-testrun/:productName/:dashboardName/:from/:until')
		.get(events.eventsForTestRun)

	app.route('/events/:eventId')
		.get(events.read)
		.put(events.update) //users.requiresLogin, events.hasAuthorization,
		.delete(events.delete); //users.requiresLogin, events.hasAuthorization,

	// Finish by binding the Event middleware
	app.param('eventId', events.eventByID);
};
