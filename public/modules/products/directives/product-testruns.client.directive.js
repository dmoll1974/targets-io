'use strict';

angular.module('products').directive('productTestruns', ProductTestRunsDirective);

function ProductTestRunsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-testruns.client.view.html',
    controller: ProductTestRunsDirectiveController
  };

  return directive;

  /* @ngInject */
  function ProductTestRunsDirectiveController ($scope, $state, Templates, Dashboards, $filter, $rootScope) {


  }
}
