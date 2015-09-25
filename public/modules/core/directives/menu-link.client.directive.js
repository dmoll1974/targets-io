(function(){
    'use strict';

    angular.module('core')
        .run(['$templateCache', function ($templateCache) {
            $templateCache.put('partials/menu-link.tmpl.html',
                '<md-button ng-class="{active: isActive(\'{{section.matcher}}\'),\'{{section.icon}}\' : true}"  \n' +
                '  data-ng-href="#!/{{section.url}}" ng-click="focusSection()">\n' +
                '  {{section.name}}\n' +
                '  <span  class="md-visually-hidden "\n' +
                '    ng-if="isSelected()">\n' +
                '    current page\n' +
                '  </span>\n' +
                '</md-button>\n' +
                '');
        }])
        .directive('menuLink', ['$location', function ($location ) {
            return {
                scope: {
                    section: '='
                },
                templateUrl: 'partials/menu-link.tmpl.html',
                link: function ($scope, $element) {
                    var controller = $element.parent().controller();

                    $scope.isActive = function (viewLocation) {
                        var regex = new RegExp('.*\/' + viewLocation + '(\/|$)');
                        var active = regex.test($location.path());
                        return active;
                    };

                    $scope.focusSection = function () {
                        // set flag to be used later when
                        // $locationChangeSuccess calls openPage()
                        controller.autoFocusContent = true;
                    };
                }
            };
        }])
})();
