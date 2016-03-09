'use strict';

angular.module('templates').directive('editTemplateMetric', EditTemplateMetricDirective);

function EditTemplateMetricDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/edit-template-metric.client.view.html',
    controller: EditTemplateMetricDirectiveController
  };

  return directive;

  /* @ngInject */
  function EditTemplateMetricDirectiveController ($scope, $rootScope, $state, Templates, Dashboards, Utils) {


      $scope.metric = Templates.metric;

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

      /* if metric has custom unit, add it to the select list */

      if($scope.metricUnits.indexOf($scope.metric.unit ) === -1){
          $scope.metricUnits.unshift($scope.metric.unit);
      }

      $scope.addCustomUnit = function(){

          $scope.metricUnits.push($scope.metric.customUnit)
          $scope.metric.unit = $scope.metric.customUnit;

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

      /* set benchmark and requirement toggles */
      if ($scope.metric.requirementValue)
          $scope.enableRequirement = true;
      if ($scope.metric.benchmarkValue)
          $scope.enableBenchmarking = true;


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


      $scope.update = function(){

        /* sort tags */
        $scope.metric.tags = $scope.metric.tags.sort(Utils.dynamicSort('text'));

      /* add tags */

      _.each($scope.metric.tags, function(tag){

          Templates.selected.tags.push(tag);

      });

      Templates.selected.tags = _.uniq(Templates.selected.tags, 'text');


        //var updateIndex = Templates.selected.metrics.map(function(metric) { return metric._id.toString(); }).indexOf('$scope.metric._id.toString()');
        //Templates.selected.metrics[updateIndex] = $scope.metric;
        Templates.update(Templates.selected).success(function (template){
            Templates.selected = template;
            Templates.selected.selectedIndex = 1;
            $state.go('viewTemplate',{templateName: template.name});
        });
      }

      $scope.clone = function () {
          //$scope.metric._id = undefined;
          //var cloneIndex = Templates.selected.metrics.map(function(metric) { return metric._id.toString(); }).indexOf('$scope.metric._id.toString()');
          Templates.metricClone = _.clone($scope.metric);
          Templates.metricClone._id = null;
          Templates.metricClone.name += '-CLONE';
          $state.go('addTemplateMetric');
      };

      $scope.cancel = function () {
          if ($rootScope.previousStateParams)
              $state.go($rootScope.previousState, $rootScope.previousStateParams);
          else
              $state.go($rootScope.previousState);
      };


  }
}
