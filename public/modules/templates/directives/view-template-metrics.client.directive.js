'use strict';

angular.module('templates').directive('templateMetrics', TemplateMetricsDirective);

function TemplateMetricsDirective () {

  var directive = {
    scope:{
        template : '='
    },
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/view-template-metrics.client.view.html',
    controller: TemplateMetricsDirectiveController,
    controllerAs: 'ctrlTemplateMetrics'
  };

  return directive;

  /* @ngInject */
  function TemplateMetricsDirectiveController ($scope, $state, Templates) {

      this.template = $scope.template;

  }
}
