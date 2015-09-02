'use strict';

angular.module('graphs').directive('shareGraphUrl', [ '$timeout',
	function($timeout) {
		return {
			restrict: "A",
			link: function(scope, element, attrs) {
				//On click
				//$(elem).click(function() {
				//	$(this).select();
				//});
				$timeout(function () {
					element[0].select();
				});
			}
		}
	}

]);
