'use strict';

angular.module('templates').directive('mergeTemplate', MergeTemplateDirective);

function MergeTemplateDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/merge-template.client.view.html',
    controller: MergeTemplateDirectiveController
  };

  return directive;

  /* @ngInject */
  function MergeTemplateDirectiveController ($scope, $rootScope, $state, Templates, Dashboards) {

      $scope.template = Templates.selected;

      _.each($scope.template.variables, function(variable, index){

          $scope.template.variables[index].values = [];
          $scope.template.variables[index].values.push('');

      })


      $scope.addValue = function (index) {
          $scope.template.variables[index].values.push('');
      };
      $scope.removeTarget = function (parentIndex, index) {
          $scope.template.variables[parentIndex].values.splice(index, 1);
      };

      $scope.cancel = function () {
          if ($rootScope.previousStateParams)
              $state.go($rootScope.previousState, $rootScope.previousStateParams);
          else
              $state.go($rootScope.previousState);
      };

      $scope.preview = function(){

          $scope.metrics = [];
          var targets = [];
          var decoratedTarget;


          _.each($scope.template.metrics, function(metric){

              _.each(metric.targets, function(target){

                  _.each($scope.template.variables, function(variable){

                      var re = new RegExp('\\$' + variable.name, 'g');

                      _.each(variable.values, function(value){

                      })

                  })

                  decoratedTarget = target.replace(re, value);
                  console.log(decoratedTarget);
                  targets.push(decoratedTarget);

              })

          })


      }

  }
}
