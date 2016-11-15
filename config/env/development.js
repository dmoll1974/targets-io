'use strict';

module.exports = {
	isProduction: false,
	isDevelopment: true,
	debugMode: true,
	logLevel: 'info',
	graphiteHost: process.env.GRAPHITE_HOST,
	jenkinsHost: process.env.JENKINS_HOST,
	db: process.env.MONGO_URL,
	redisHost: process.env.REDIS_SERVICE_HOST,
	redisPort: process.env.REDIS_SERVICE_PORT,
	jenkinsUser: process.env.JENKINS_USER,
	jenkinsPassword: process.env.JENKINS_PASSWORD,
	graylog : {
		host: process.env.GRAYLOG_HOST,
		port: process.env.GRAYLOG_PORT
	},


	app: {
		title: 'targets-io - Development Environment'
	}
};
