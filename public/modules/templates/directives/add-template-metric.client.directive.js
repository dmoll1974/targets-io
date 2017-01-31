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



      $scope.addCustomUnit = addCustomUnit;
      $scope.addTarget = addTarget;
      $scope.removeTarget = removeTarget;
      $scope.loadTags = loadTags;
      $scope.create = create;
      $scope.cancel = cancel;

          /* Watches */

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

      /* activate */

      activate();

      /* functions */

      function activate() {


          if (Templates.metricClone.alias) {
              $scope.metric = _.cloneDeep(Templates.metricClone);
              Templates.metricClone = undefined;
              /* set benchmark and requirement toggles */
              if ($scope.metric.requirementValue)
                  $scope.enableRequirement = true;
              if ($scope.metric.benchmarkValue)
                  $scope.enableBenchmarking = true;
          } else {
              $scope.metric = {};
              $scope.metric.targets = [''];
              $scope.enableBenchmarking = 'disabled';
              $scope.enableRequirement = 'disabled';
          }

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

          $scope.variables = Templates.selected.variables;

      }


      function addCustomUnit(){

          $scope.metricUnits.push($scope.metric.customUnit)
          $scope.metric.unit = $scope.metric.customUnit;

      }


      function addTarget() {
          $scope.metric.targets.push('');
          $scope.graphiteTargets = $scope.defaultGraphiteTargets;
      };

      function removeTarget(index) {
          $scope.metric.targets.splice(index, 1);
      };

      function loadTags(query) {

          var matchedTags = [];
          _.each(Templates.selected.tags, function (tag) {
              if (tag.text.toLowerCase().match(query.toLowerCase()))
                  matchedTags.push(tag);
          });
          return matchedTags;
      };


      function create(){

          /* sort tags */
          if($scope.metric.tags.length > 1)$scope.metric.tags = $scope.metric.tags.sort(Utils.dynamicSort('text'));

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

      function cancel() {
          if ($rootScope.previousStateParams)
              $state.go($rootScope.previousState, $rootScope.previousStateParams);
          else
              $state.go($rootScope.previousState);
      };

  }
}
