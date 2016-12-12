'use strict';

var path = require('path');

module.exports = {
	isDevelopment: true,
	debugMode: true,
	logLevel: 'info',
	graphiteUrl: process.env.GRAPHITE_HOST,
	jenkinsUrl: process.env.JENKINS_URL,
	db: process.env.MONGO_URL,
	redisHost: process.env.REDIS_HOST,
	redisPort: process.env.REDIS_PORT,
	jenkinsUser: process.env.JENKINS_USER,
	jenkinsPassword: process.env.JENKINS_PASSWORD,
	jenkinsCaFile: path.resolve('./config/ssl-ca', 'Jenkins_root_CA.cer'),
	jenkinsSSL: true,
	graylog : {
		host: process.env.GRAYLOG_HOST,
		port: process.env.GRAYLOG_PORT
	},


	app: {
		title: 'targets-io - Development Environment'
	}
};
