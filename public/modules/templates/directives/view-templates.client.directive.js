'use strict';

angular.module('templates').directive('viewTemplates', ViewTemplatesDirective);

function ViewTemplatesDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/view-templates.client.view.html',
    controller: ViewTemplatesDirectiveController//,
    //controllerAs: 'ctrlTemplate'
  };

  return directive;

  /* @ngInject */
  function ViewTemplatesDirectiveController ($scope, $state, $stateParams, Templates, Dashboards) {

    Templates.getAll().success(function(templates){

      $scope.templates = templates;

    });

    $scope.viewTemplate = function(index){

        $state.go('viewTemplate', {templateName: $scope.templates[index].name})
    }

    $scope.addTemplate = function (){

      $state.go('addTemplate');
    };
  }
}
