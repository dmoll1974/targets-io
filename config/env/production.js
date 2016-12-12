'use strict';

var path = require('path');


module.exports = {
    isDevelopment: false,
    logLevel: 'warning',                           // Winston log level
    graphiteRetentionPeriod: '90d', /*90 days*/    // Should match your Graphite retention settings. Test runs will be deleted if older than graphiteRetentionPeriod
    graphiteUrl: process.env.GRAPHITE_URL,       // Graphite Render URL API, e.g. "http://graphite.mycompany.com:8090"
    db: process.env.MONGO_URL,                     // MongoDb url, e.g. "dbServer.mycompany.com:27017/targets-io"
    dbConnectionPooling: true,
    dbUsername: process.env.MONGO_USER,            // MongoDb user
    dbPassword: process.env.MONGO_PASSWORD,        // MongoDb password
    graylog : {                                    // Graylog server and port, omit when not needed
        host: process.env.GRAYLOG_HOST,
        port: process.env.GRAYLOG_PORT
    },
    redisHost: process.env.REDIS_HOST,     // Redis server, e.g. "redis.mycompany.com"
    redisPort: process.env.REDIS_PORT,     // Redis port, e.g. "6379"
    jenkinsUrl: process.env.JENKINS_URL,         // Jenkins URL, e.g. "https://jenkins.mycompany.com:443"
    jenkinsUser: process.env.JENKINS_USER,         // Jenkins admin user
    jenkinsPassword: process.env.JENKINS_PASSWORD, // Jenkins admin password
    jenkinsSSL: true,                              // Jenkins running on https
    jenkinsCaFile: path.resolve('./config/ssl-ca', 'Jenkins_root_CA.cer'), // If you are using self-signed certificate for Jenkins, provide CA sertificate


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
                'public/lib/sc-date-time/dist/sc-date-time.css'

            ],
            js: [
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/jquery-ui/jquery-ui.min.js',
                'public/lib/angular/angular.min.js',
                'public/lib/angular-cookies/angular-cookies.min.js',
                'public/lib/angular-sanitize/angular-sanitize.min.js',
                'public/lib/angular-aria/angular-aria.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-material/angular-material.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-messages/angular-messages.min.js',
                'public/lib/showdown/dist/showdown.min.js',
                'public/lib/showdown-target-blank/dist/showdown-target-blank.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/lib/moment/moment.js',
                'public/lib/angular-spinners/dist/angular-spinners.js',
                'public/lib/angular-busy/dist/angular-busy.js',
                'public/lib/ng-table/dist/ng-table.js',
                'public/lib/ng-tags-input/ng-tags-input.min.js',
                'public/lib/underscore/underscore-min.js',
                'public/lib/angular-ui-bootstrap-datetimepicker/datetimepicker.js',
                'public/lib/ng-clip/dest/ng-clip.min.js',
                'public/lib/zeroclipboard/dist/ZeroClipboard.min.js',
                'public/lib/angular-utils-pagination/dirPagination.js',
                'public/lib/dygraphs/dygraph-combined-dev.js',
                'public/js/dygraph-extra.js',
                'public/lib/ng-focus-if/focusIf.min.js',
                'public/lib/socket.io-client/dist/socket.io.min.js',
                'public/lib/ng-sortable/dist/ng-sortable.js',
                'public/lib/pdfmake-dist/build/pdfmake.min.js',
                'public/lib/pdfmake-dist/build/vfs_fonts.js',
                'public/lib/sc-date-time/dist/sc-date-time.js'


            ]
        },
        css: [
            'public/modules/**/css/*.css'
        ],
        js: [
            'public/config.js',
            'public/application.js',
            'public/modules/*/*.js',
            'public/modules/*/*[!tests]*/*.js',
            'public/modules/*/*[!tests]*/*/*.js'

        ]
    }
};
