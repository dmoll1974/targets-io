'use strict';

module.exports = {
	isProduction: false,
	isDemo: true,
	isDevelopment: false,
	logLevel: 'warning',
	graphiteRetentionPeriod: '90d', /*90 days*/
	graphiteHost: process.env.GRAPHITE_HOST,
	jenkinsHost: process.env.JENKINS_HOST,
	db: process.env.MONGO_URL,
	dbUsername: process.env.MONGO_USER,
	dbPassword: process.env.MONGO_PASSWORD,
	graylog : {
		host: process.env.GRAYLOG_HOST,
		port: process.env.GRAYLOG_PORT
	},
	redisHost: process.env.REDIS_SERVICE_HOST,
	redisPort: process.env.REDIS_SERVICE_PORT,
	jenkinsUser: process.env.JENKINS_USER,
	jenkinsPassword: process.env.JENKINS_PASSWORD,
	jenkinsSSL: false,


	app: {
		title: 'targets-io - Demo'
	}
};
