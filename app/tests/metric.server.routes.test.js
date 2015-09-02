'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Metric = mongoose.model('Metric'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, metric;

/**
 * Metric routes tests
 */
describe('Metric CRUD tests', function() {
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

		// Save a user to the test db and create new Metric
		user.save(function() {
			metric = {
				name: 'Metric Name'
			};

			done();
		});
	});

	it('should be able to save Metric instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Metric
				agent.post('/metrics')
					.send(metric)
					.expect(200)
					.end(function(metricSaveErr, metricSaveRes) {
						// Handle Metric save error
						if (metricSaveErr) done(metricSaveErr);

						// Get a list of Metrics
						agent.get('/metrics')
							.end(function(metricsGetErr, metricsGetRes) {
								// Handle Metric save error
								if (metricsGetErr) done(metricsGetErr);

								// Get Metrics list
								var metrics = metricsGetRes.body;

								// Set assertions
								(metrics[0].user._id).should.equal(userId);
								(metrics[0].name).should.match('Metric Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Metric instance if not logged in', function(done) {
		agent.post('/metrics')
			.send(metric)
			.expect(401)
			.end(function(metricSaveErr, metricSaveRes) {
				// Call the assertion callback
				done(metricSaveErr);
			});
	});

	it('should not be able to save Metric instance if no name is provided', function(done) {
		// Invalidate name field
		metric.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Metric
				agent.post('/metrics')
					.send(metric)
					.expect(400)
					.end(function(metricSaveErr, metricSaveRes) {
						// Set message assertion
						(metricSaveRes.body.message).should.match('Please fill Metric name');
						
						// Handle Metric save error
						done(metricSaveErr);
					});
			});
	});

	it('should be able to update Metric instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Metric
				agent.post('/metrics')
					.send(metric)
					.expect(200)
					.end(function(metricSaveErr, metricSaveRes) {
						// Handle Metric save error
						if (metricSaveErr) done(metricSaveErr);

						// Update Metric name
						metric.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Metric
						agent.put('/metrics/' + metricSaveRes.body._id)
							.send(metric)
							.expect(200)
							.end(function(metricUpdateErr, metricUpdateRes) {
								// Handle Metric update error
								if (metricUpdateErr) done(metricUpdateErr);

								// Set assertions
								(metricUpdateRes.body._id).should.equal(metricSaveRes.body._id);
								(metricUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Metrics if not signed in', function(done) {
		// Create new Metric model instance
		var metricObj = new Metric(metric);

		// Save the Metric
		metricObj.save(function() {
			// Request Metrics
			request(app).get('/metrics')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Metric if not signed in', function(done) {
		// Create new Metric model instance
		var metricObj = new Metric(metric);

		// Save the Metric
		metricObj.save(function() {
			request(app).get('/metrics/' + metricObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', metric.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Metric instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Metric
				agent.post('/metrics')
					.send(metric)
					.expect(200)
					.end(function(metricSaveErr, metricSaveRes) {
						// Handle Metric save error
						if (metricSaveErr) done(metricSaveErr);

						// Delete existing Metric
						agent.delete('/metrics/' + metricSaveRes.body._id)
							.send(metric)
							.expect(200)
							.end(function(metricDeleteErr, metricDeleteRes) {
								// Handle Metric error error
								if (metricDeleteErr) done(metricDeleteErr);

								// Set assertions
								(metricDeleteRes.body._id).should.equal(metricSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Metric instance if not signed in', function(done) {
		// Set Metric user 
		metric.user = user;

		// Create new Metric model instance
		var metricObj = new Metric(metric);

		// Save the Metric
		metricObj.save(function() {
			// Try deleting Metric
			request(app).delete('/metrics/' + metricObj._id)
			.expect(401)
			.end(function(metricDeleteErr, metricDeleteRes) {
				// Set message assertion
				(metricDeleteRes.body.message).should.match('User is not logged in');

				// Handle Metric error error
				done(metricDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Metric.remove().exec();
		done();
	});
});