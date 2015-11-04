(function () {
  'use strict';
  angular.module('core').directive('recordAvailabilityValidator', [
    '$http',
    '$filter',
    function ($http, $filter) {
      return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
          var apiUrl = attrs.recordAvailabilityValidator;
          scope.$watch('dashboard.name', function (val) {
            scope.dashboard.name = $filter('uppercase')(val);
          }, true);
          scope.$watch('product.name', function (val) {
            scope.product.name = $filter('uppercase')(val);
          }, true);
          scope.$watch('event.dashboardName', function (val) {
            scope.event.dashboardName = $filter('uppercase')(val);
          }, true);
          scope.$watch('event.productName', function (val) {
            scope.event.productName = $filter('uppercase')(val);
          }, true);
          function setAsLoading(bool) {
            ngModel.$setValidity('recordLoading', !bool);
          }
          function setAsAvailable(bool) {
            ngModel.$setValidity('recordAvailable', bool);
          }
          ngModel.$parsers.push(function (value) {
            if (!value || value.length === 0)
              return;
            setAsLoading(true);
            setAsAvailable(false);
            $http.get(apiUrl + '/' + value, { v: value }).success(function () {
              setAsLoading(false);
              setAsAvailable(false);
            }).error(function () {
              setAsLoading(false);
              setAsAvailable(true);
            });
            return value;
          });
        }
      };
    }
  ]);
}());