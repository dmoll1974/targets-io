'use strict';

var mongoose = require('mongoose');
var winston = require('winston');
var config = require('./config/config');

var mongoSetup = module.exports;

// Connect to mongodb with mongoose
mongoSetup.connect = function() {


    if(config.dbUsername && config.dbPassword ){

        var mongoUrl = 'mongodb://' + config.dbUsername + ':' + config.dbPassword + '@' + config.db;

    }else{

        var mongoUrl = 'mongodb://' + config.db;
    }



    mongoose.connection.once('open', function() {
        winston.info('Connected to MongoDB server with mongoose.');
        console.log('Connected to MongoDB server with mongoose.');
    });

    mongoose.connection.on('error', function (err) {
        winston.error("MongoDb connect error: " + err);
        console.error("MongoDb connect error: " + err);
    });

    mongoose.connection.on('disconnected', () => {
        // http://mongoosejs.com/docs/connections.html
        winston.info('Disconnected MongoDB with mongoose, will autoreconnect a number of times');
    });

    // If the Node process ends, gracefully close the Mongoose connection
    ['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, function cleanup() {
            mongoose.connection.close(() => {
                winston.info('Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });
    });

    var options = (config.dbConnectionPooling === true) ?
    {
        server: {
            poolSize: 10,
            auto_reconnect: true,
            reconnectTries: 30,
            socketOptions: {
                keepAlive: 100000,
                connectTimeoutMS: 10000
            }
        }
    }: {};

    return mongoose.connect(mongoUrl, options);

};
