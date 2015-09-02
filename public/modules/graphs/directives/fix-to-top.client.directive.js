'use strict';

angular.module('graphs').directive('fixToTop', [ '$window',
	function($window) {

		var $win = angular.element($window); // wrap window object as jQuery object

		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var topClass = attrs.fixToTop, // get CSS class from directive's attribute value
					offsetTop = element.prop('offsetTop'); // get element's top relative to the document

				$win.on('scroll', function (e) {
					if ($win[0].pageYOffset >= offsetTop) {
						element.addClass(topClass);
					} else {
						element.removeClass(topClass);
					}
				});
			}
		}
	}
]);
