'use strict';

angular.module('templates').directive('templateVariables', TemplateVariablesDirective);

function TemplateVariablesDirective () {

  var directive = {

    restrict: 'EA',
    templateUrl: 'modules/templates/directives/view-template-variables.client.view.html',
    controller: TemplateVariablesDirectiveController,
    controllerAs: 'ctrlTemplateVariables'
  };

  return directive;

  /* @ngInject */
  function TemplateVariablesDirectiveController ($scope, $state, Templates) {


      $scope.addVariable = function(){

        $state.go('addVariable');

      }

  }
}
