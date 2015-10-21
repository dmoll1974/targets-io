(function() {
    'use strict';



    angular.module('core')
        .directive('recordAvailabilityValidator',
        ['$http', function($http) {

            return {
                require : 'ngModel',
                link : function(scope, element, attrs, ngModel) {
                    var apiUrl = attrs.recordAvailabilityValidator ;

                    function setAsLoading(bool) {
                        ngModel.$setValidity('recordLoading', !bool);
                    }

                    function setAsAvailable(bool) {
                        ngModel.$setValidity('recordAvailable', bool);
                    }

                    ngModel.$parsers.push(function(value) {
                        if(!value || value.length == 0) return;

                        setAsLoading(true);
                        setAsAvailable(false);

                        $http.get(apiUrl + '/' + value.toUpperCase(), { v : value })
                            .success(function() {
                                setAsLoading(false);
                                setAsAvailable(false);
                            })
                            .error(function() {
                                setAsLoading(false);
                                setAsAvailable(true);

                            });

                        return value;
                    })
                }
            }
        }]);
}());
