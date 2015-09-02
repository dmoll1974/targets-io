'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Event = mongoose.model('Event'),
	Testrun = mongoose.model('Testrun'),
	testruns = require('./testruns.server.controller'),
	_ = require('lodash');

/**
 * Create a Event
 */
exports.create = function(req, res) {
	var event = new Event(req.body);
	event.user = req.user;

	event.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(event);
			/* if "end" event, check if corresponding "start" event exist and add to test runs */

			if (event.eventDescription === "end"){

				Event.findOne({$and:[{testRunId: event.testRunId}, {eventDescription: "start"}]}).exec(function(err, startEvent) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {

						var testRun = new Testrun();
						testRun.start = startEvent.eventTimestamp;
						testRun.end = event.eventTimestamp;
						testRun.productName = event.productName;
						testRun.dashboardName = event.dashboardName;
						testRun.testRunId = event.testRunId;
						testRun.baseline = event.baseline;
						testRun.buildResultKey = event.buildResultKey
						testRun.eventIds.push(startEvent._id, event._id);

						testruns.persistTestRunById(testRun.productName, testRun.dashboardName, testRun, function(storedTestrun){

							console.log("test run stored");
						})


					}
				});
			}
		}
	});
};

/**
 * Show the current Event
 */
exports.read = function(req, res) {
	res.jsonp(req.event);
};

/**
 * Update a Event
 */
exports.update = function(req, res) {
	var event = req.event ;

	event = _.extend(event , req.body);

	event.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(event);
		}
	});
};

/**
 * Delete an Event
 */
exports.delete = function(req, res) {
	var event = req.event ;

	event.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(event);
		}
	});
};

/**
 * List of Events
 */
exports.list = function(req, res) { 
	Event.find().sort('-created').populate('user', 'displayName').exec(function(err, events) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(events);
		}
	});
};

/*
 * List events for dashboard
*/
exports.eventsForDashboard = function(req, res) {
    Event.find( { $and: [ { productName: req.params.productName }, { dashboardName: req.params.dashboardName } ] } ).sort('-eventTimestamp').exec(function(err, events) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(events);
        }
    });
};

/*
 * List events for testrun
 */
exports.eventsForTestRun = function(req, res) {
	Event.find( { $and: [ { productName: req.params.productName }, { dashboardName: req.params.dashboardName } ], eventTimestamp: {$lte: req.params.until, $gte: req.params.from} } ).sort('-eventTimestamp').exec(function(err, events) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(events);
		}
	});
};



/*
 * Event middleware
 */
exports.eventByID = function(req, res, next, id) { 
	Event.findById(id).populate('user', 'displayName').exec(function(err, event) {
		if (err) return next(err);
		if (! event) return next(new Error('Failed to load Event ' + id));
		req.event = event ;
		next();
	});
};

/**
 * Event authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.event.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
