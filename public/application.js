'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]).config(['$httpProvider',  function ($httpProvider) {

    var interceptor = ['$cookies', function($cookies) {
        return {
            'request': function(config) {
                // remove io cookie from headers when sending requests to graphite to prevent stickyness
                if (config.url.indexOf('/graphite') !== -1) {
                    $cookies.remove('io');
                }
                return config;
            }
        };
    }];

    $httpProvider.interceptors.push(interceptor);
}])
    .run(['$rootScope', 'Interval', 'Products', 'TargetsIoHeader', '$stateParams', '$cookies', function($rootScope, Interval, Products, TargetsIoHeader, $stateParams, $cookies){

        $rootScope.previousState;
        $rootScope.currentState;
        $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from.name;
            $rootScope.previousStateParams = fromParams;
            $rootScope.currentState = to.name;
            $rootScope.currentStateParams = toParams;

            /* clear all running Intervals when leaving the live graphs state*/

            if ($rootScope.previousState === 'viewLiveGraphs') Interval.clearAll();


            // keep user logged in after page refresh
            $rootScope.globals = $cookies.get('globals') || {};
            if ($rootScope.globals.currentUser) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
            }


            //    console.log('Previous state:'+$rootScope.previousState)
        //    console.log('Current state:'+$rootScope.currentState)
        });
    }
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
