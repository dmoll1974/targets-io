'use strict';

module.exports = {
	//db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/targets-io',
	//assets: {
	//	lib: {
	//		css: [
	//			'public/lib/bootstrap/dist/css/bootstrap.min.css',
	//			'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
	//		],
	//		js: [
	//			'public/lib/angular/angular.min.js',
	//			'public/lib/angular-resource/angular-resource.js',
	//			'public/lib/angular-ui-router/release/angular-ui-router.min.js',
	//			'public/lib/angular-ui-utils/ui-utils.min.js',
	//		]
	//	},
	//	css: 'public/dist/application.min.css',
	//	js: 'public/dist/application.min.js'
	//},
    graphiteHost: process.env.GRAPHITE_HOST,
    db: process.env.MONGO_URL + '/targets-io',
    memcachedHost: [process.env.MEMCACHED_HOST],
    assets: {
        lib: {
            css: [
                'public/lib/angular-material/angular-material.min.css',
                'public/css/style.css',
                'public/lib/components-font-awesome/css/font-awesome.min.css',
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
                'public/lib/angular-busy/dist/angular-busy.css',
                'public/lib/ng-table/dist/ng-table.css',
                'public/lib/ng-tags-input/ng-tags-input.min.css',
                'public/lib/angular-ui-bootstrap-datetimepicker/datetimepicker.css'
            ],
            js: [
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/angular/angular.min.js',
                'public/lib/angular-aria/angular-aria.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-material/angular-material.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-messages/angular-messages.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/lib/moment/moment.js',
                'public/lib/angular-spinners/dist/angular-spinners.js',
                'public/lib/angular-busy/dist/angular-busy.js',
                'public/lib/ng-table/dist/ng-table.js',
                'public/lib/ng-tags-input/ng-tags-input.min.js',
                'public/lib/underscore/underscore-min.js',
                'public/lib/highstock-release/highstock.js',
                'public/lib/highstock-release/exporting.js',
                'public/lib/angular-ui-bootstrap-datetimepicker/datetimepicker.js',
                'public/lib/ng-clip/dest/ng-clip.min.js',
                'public/lib/zeroclipboard/dist/ZeroClipboard.min.js',
                'public/lib/bootstrap-ui-datetime-picker/dist/datetime-picker.min.js',
                'public/lib/angular-utils-pagination/dirPagination.js'

            ]
        },
        css: [
            'public/modules/**/css/*.css'
        ],
        js: [
            'public/config.js',
            'public/application.js',
            'public/modules/*/*.js',
            'public/modules/*/*[!tests]*/*.js'
        ]
    },
        facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: '/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: '/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: '/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
