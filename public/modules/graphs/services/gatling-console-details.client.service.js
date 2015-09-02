'use strict';

angular.module('graphs').factory('GatlingConsoleDetails', ['$http',
	function($http) {
		var GatlingConsoleDetails = {
			getData: getData
		};

		return GatlingConsoleDetails;

		function getData(consoleUrl, running){

			var postData = {consoleUrl: consoleUrl, running: running };

			return $http.post('/jenkins-stdout', postData);
		}
	}
]);
