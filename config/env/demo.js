'use strict';

module.exports = {
	isProduction: false,
	isDemo: true,
	logLevel: 'error',
	graphiteHost: process.env.GRAPHITE_HOST,
	jenkinsHost: process.env.JENKINS_HOST,
	db: process.env.MONGO_URL,
	redisHost: process.env.REDIS_SERVICE_HOST,
	redisPort: process.env.REDIS_SERVICE_PORT,
	jenkinsUser: process.env.JENKINS_USER,
	jenkinsPassword: process.env.JENKINS_PASSWORD,


	app: {
		title: 'targets-io - Demo'
	}
};
