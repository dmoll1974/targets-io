'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, event;

/**
 * Event routes tests
 */
describe('Event CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Event
		user.save(function() {
			event = {
				name: 'Event Name'
			};

			done();
		});
	});

	it('should be able to save Event instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Event
				agent.post('/events')
					.send(event)
					.expect(200)
					.end(function(eventSaveErr, eventSaveRes) {
						// Handle Event save error
						if (eventSaveErr) done(eventSaveErr);

						// Get a list of Events
						agent.get('/events')
							.end(function(eventsGetErr, eventsGetRes) {
								// Handle Event save error
								if (eventsGetErr) done(eventsGetErr);

								// Get Events list
								var events = eventsGetRes.body;

								// Set assertions
								(events[0].user._id).should.equal(userId);
								(events[0].name).should.match('Event Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Event instance if not logged in', function(done) {
		agent.post('/events')
			.send(event)
			.expect(401)
			.end(function(eventSaveErr, eventSaveRes) {
				// Call the assertion callback
				done(eventSaveErr);
			});
	});

	it('should not be able to save Event instance if no name is provided', function(done) {
		// Invalidate name field
		event.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Event
				agent.post('/events')
					.send(event)
					.expect(400)
					.end(function(eventSaveErr, eventSaveRes) {
						// Set message assertion
						(eventSaveRes.body.message).should.match('Please fill Event name');
						
						// Handle Event save error
						done(eventSaveErr);
					});
			});
	});

	it('should be able to update Event instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Event
				agent.post('/events')
					.send(event)
					.expect(200)
					.end(function(eventSaveErr, eventSaveRes) {
						// Handle Event save error
						if (eventSaveErr) done(eventSaveErr);

						// Update Event name
						event.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Event
						agent.put('/events/' + eventSaveRes.body._id)
							.send(event)
							.expect(200)
							.end(function(eventUpdateErr, eventUpdateRes) {
								// Handle Event update error
								if (eventUpdateErr) done(eventUpdateErr);

								// Set assertions
								(eventUpdateRes.body._id).should.equal(eventSaveRes.body._id);
								(eventUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Events if not signed in', function(done) {
		// Create new Event model instance
		var eventObj = new Event(event);

		// Save the Event
		eventObj.save(function() {
			// Request Events
			request(app).get('/events')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Event if not signed in', function(done) {
		// Create new Event model instance
		var eventObj = new Event(event);

		// Save the Event
		eventObj.save(function() {
			request(app).get('/events/' + eventObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', event.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Event instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Event
				agent.post('/events')
					.send(event)
					.expect(200)
					.end(function(eventSaveErr, eventSaveRes) {
						// Handle Event save error
						if (eventSaveErr) done(eventSaveErr);

						// Delete existing Event
						agent.delete('/events/' + eventSaveRes.body._id)
							.send(event)
							.expect(200)
							.end(function(eventDeleteErr, eventDeleteRes) {
								// Handle Event error error
								if (eventDeleteErr) done(eventDeleteErr);

								// Set assertions
								(eventDeleteRes.body._id).should.equal(eventSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Event instance if not signed in', function(done) {
		// Set Event user 
		event.user = user;

		// Create new Event model instance
		var eventObj = new Event(event);

		// Save the Event
		eventObj.save(function() {
			// Try deleting Event
			request(app).delete('/events/' + eventObj._id)
			.expect(401)
			.end(function(eventDeleteErr, eventDeleteRes) {
				// Set message assertion
				(eventDeleteRes.body.message).should.match('User is not logged in');

				// Handle Event error error
				done(eventDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Event.remove().exec();
		done();
	});
});