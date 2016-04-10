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


      if (Templates.metricClone.alias){
          $scope.metric = Templates.metricClone;
          Templates.metricClone = {};
          /* set benchmark and requirement toggles */
          if ($scope.metric.requirementValue)
              $scope.enableRequirement = true;
          if ($scope.metric.benchmarkValue)
              $scope.enableBenchmarking = true;
      }else {
          $scope.metric = {};
          $scope.metric.targets = [''];
          $scope.enableBenchmarking = 'disabled';
          $scope.enableRequirement = 'disabled';
      }

      /* watch benchmark and requirement toggles */

      $scope.$watch('enableRequirement', function (newVal, oldVal) {
          if (newVal !== oldVal) {
              if ($scope.enableRequirement === false) {
                  $scope.metric.requirementOperator = null;
                  $scope.metric.requirementValue = null;
              }
          }
      });
      $scope.$watch('enableBenchmarking', function (newVal, oldVal) {
          if (newVal !== oldVal) {
              if ($scope.enableBenchmarking === false) {
                  $scope.metric.benchmarkOperator = null;
                  $scope.metric.benchmarkValue = null;
              }
          }
      });

      /* values for form drop downs*/
      $scope.metricTypes = [
          'Average',
          'Maximum',
          'Minimum',
          'Last',
          'Gradient'
      ];


      $scope.metricUnits = [
          'None',
          'Count',
          'Errors',
          'Mb',
          'Milliseconds',
          'Percentage',
          'Responses',
          'Bytes/second',
          'CPUsec',
          'Users',
          'Custom'
      ];

      $scope.addCustomUnit = function(){

          $scope.metricUnits.push($scope.metric.customUnit)
          $scope.metric.unit = $scope.metric.customUnit;

      }

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

      /* add tags */

          _.each($scope.metric.tags, function(tag){

              Templates.selected.tags.push(tag);

          });

      Templates.selected.tags = _.uniq(Templates.selected.tags, 'text');

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
