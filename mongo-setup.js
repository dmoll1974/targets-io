'use strict';

var mongoose = require('mongoose');
var winston = require('winston');
var config = require('./config/config');
var $q = require('q');


var mongoSetup = module.exports;

// Connect to mongodb with mongoose
mongoSetup.connect = function() {


    mongoose.Promise = $q.Promise;

    if(config.dbUsername && config.dbPassword ){

        var mongoUrl = 'mongodb://' + config.dbUsername + ':' + config.dbPassword + '@' + config.db;

    }else{

        var mongoUrl = 'mongodb://' + config.db;
    }

    winston.info('MongoDB: connecting to ' + config.db );


    var options = (config.dbConnectionPooling === true) ?
        {
            server: {
                poolSize: 20,
                auto_reconnect: true, // already default, but explicit
                reconnectTries: 600, // amount of attempts to reconnect
                reconnectInterval: 1000, // interval between reconnection attempts
                socketOptions: {
                    keepAlive: 100000, // less then 120s configured on mongo side
                    connectTimeoutMS: 10000
                }
            }
        }: {};

    mongoose.connect(mongoUrl, options);


    mongoose.connection.on('open', () => {
        winston.info('MongoDB: Opened connection to server with mongoose.');
    });

    mongoose.connection.on('connecting', () => {
        winston.info('MongoDB: Connecting to server with mongoose..');
    });

    mongoose.connection.on('connected', () => {
        winston.info('MongoDB: Connected to server with mongoose..');
    });

    mongoose.connection.on('reconnected', () => {
        winston.warn('MongoDB: Reconnected to server with mongoose.');
    });

    mongoose.connection.on('close', () => {
        winston.error('MongoDB: Closed connection to server with mongoose.');
    });

    mongoose.connection.on('error', (err) => {
        winston.error('MongoDB: error: ' + err.message);
    });

    mongoose.connection.on('disconnected', () => {

        winston.error([
            'MongoDB: Disconnected from server, will autoreconnect',
            options.server.reconnectTries,
            'times with a ',
            options.server.reconnectInterval + 'ms',
            'interval'
        ].join(' '));

    });

    mongoose.connection.on('disconnecting', () => {

        winston.error([
            'MongoDB: Disconnected from server, will autoreconnect',
            options.server.reconnectTries,
            'times with a ',
            options.server.reconnectInterval + 'ms',
            'interval'
        ].join(' '));

    });

    // If the Node process ends, gracefully close the Mongoose connection
    ['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, function cleanup() {
            mongoose.connection.close(() => {
                // jscs:disable
                console.log('Mongoose default connection disconnected through app termination');
                // jscs:enable
                process.exit(0);
            });
        });
    });
};
