'use strict';

var mongoose = require('mongoose');
var winston = require('winston');
var config = require('./config/config');

var mongoSetup = module.exports;

// Connect to mongodb with mongoose
mongoSetup.connect = function() {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var options = {
        //user: config.dbUsername,
        //pass: config.dbPassword,
        server: {
            poolSize: 10,
            auto_reconnect: true, // already default, but explicit
            reconnectTries: 30, // already default, explicit
            socketOptions: {
                keepAlive: 100000, // less then 120s configured on mongo side
                connectTimeoutMS: 10000
            }
        }
    };

    if(config.dbUsername && config.dbPassword ){

        var mongoUrl = 'mongodb://' + config.dbUsername + ':' + config.dbPassword + '@' + config.db;

    }else{

        var mongoUrl = 'mongodb://' + config.db;
    }



    mongoose.connection.once('open', function() {
        console.log('Connected to MongoDB server with mongoose.');
    });

    mongoose.connection.on('error', function (err) { console.log("Connect error: " + err) });

    mongoose.connection.on('disconnected', () => {
        // http://mongoosejs.com/docs/connections.html
        console.log('Disconnected MongoDB with mongoose, will autoreconnect a number of times');
    });

    // If the Node process ends, gracefully close the Mongoose connection
    ['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, function cleanup() {
            mongoose.connection.close(() => {
                console.log('Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });
    });


    return mongoose.connect(mongoUrl, options);

};
