'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
	cluster = require('cluster');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
console.log ("mongoDb connect to: " + config.db)
console.log ("memcached host: " + config.memcachedHost)
console.log ("graphite host: " + config.graphiteHost)


// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

if(cluster.isMaster) {
	var numWorkers = require('os').cpus().length;

	console.log('Master cluster setting up ' + numWorkers + ' workers...');

	for(var i = 0; i < numWorkers; i++) {
		cluster.fork();
	}

	cluster.on('online', function(worker) {
		console.log('Worker ' + worker.process.pid + ' is online');
	});

	cluster.on('exit', function(worker, code, signal) {
		console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
		console.log('Starting a new worker');
		cluster.fork();
	});

/* spawn child process that synchronizes running tests */

	var child_process = require('child_process');
	var debug = typeof v8debug === 'object';
	if (debug) {
		//Set an unused port number.
		process.execArgv.push('--debug=' + (40894));
	}

	var env = { mongoUrl: config.db };

	var synchronizeRunningTestsDaemonFork = child_process.fork('./app/controllers/synchronize-running-tests.js', [], { env: env });

	synchronizeRunningTestsDaemonFork.on('exit', function (code, signal) {
		console.log("synchronizeRunningTestsDaemonFork process terminated with code: " + code);
		synchronizeRunningTestsDaemonFork = child_process.fork('./app/controllers/synchronize-running-tests.js');
	});

} else {
	var app = require('./config/express')(db);

	app.disable('etag');

	app.all('/*', function(req, res) {res.send('process ' + process.pid + ' says hello!').end();})

	app.listen(config.port, function() {
		console.log('Process ' + process.pid + ' is listening to all incoming requests');
	});

	// Expose app
	exports = module.exports = app;
	// Expose cluster
	exports = module.exports = cluster;

}

// Init the express application
//var app = require('./config/express')(db);


//app.disable('etag');


// Bootstrap passport config
//require('./config/passport')();

// Start the app by listening on <port>
//app.listen(config.port);

// Expose app
//exports = module.exports = app;

// Logging initialization
//console.log('MEAN.JS application started on port ' + config.port);
