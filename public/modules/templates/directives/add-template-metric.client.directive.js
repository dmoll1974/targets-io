'use strict';

angular.module('templates').directive('addTemplateMetric', AddTemplateMetricDirective);

function AddTemplateMetricDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/add-template-metric.client.view.html',
    controller: AddTemplateMetricDirectiveController
  };

  return directive;

  /* @ngInject */
  function AddTemplateMetricDirectiveController ($scope, $rootScope, $state, Templates, Dashboards, Utils) {

      $scope.metric={};
      $scope.metric.targets = [''];
      $scope.enableBenchmarking = 'disabled';
      $scope.enableRequirement = 'disabled';

      $scope.variables = Templates.selected.variables;

      $scope.addTarget = function () {
          $scope.metric.targets.push('');
          $scope.graphiteTargets = $scope.defaultGraphiteTargets;
      };
      $scope.removeTarget = function (index) {
          $scope.metric.targets.splice(index, 1);
      };
      $scope.loadTags = function (query) {

          var matchedTags = [];
          _.each(Templates.selected.tags, function (tag) {
              if (tag.text.toLowerCase().match(query.toLowerCase()))
                  matchedTags.push(tag);
          });
          return matchedTags;
      };


      $scope.create = function(){

      /* sort tags */
      $scope.metric.tags = $scope.metric.tags.sort(Utils.dynamicSort('text'));

        Templates.selected.metrics.push($scope.metric);
        Templates.update(Templates.selected).success(function (template){
            Templates.selected = template;
            Templates.selected.selectedIndex = 1;
            $state.go('viewTemplate',{templateName: template.name});
        });
      }

      $scope.cancel = function () {
          if ($rootScope.previousStateParams)
              $state.go($rootScope.previousState, $rootScope.previousStateParams);
          else
              $state.go($rootScope.previousState);
      };

  }
}
