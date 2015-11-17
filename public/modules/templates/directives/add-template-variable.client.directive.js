'use strict';

angular.module('templates').directive('addTemplateVariable', AddTemplateVariableDirective);

function AddTemplateVariableDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/add-template-variable.client.view.html',
    controller: AddTemplateVariableDirectiveController//,
    //controllerAs: 'ctrlAddTemplateVariable'
  };

  return directive;

  /* @ngInject */
  function AddTemplateVariableDirectiveController ($scope, $rootScope, $state, Templates, $filter) {

  $scope.$watch('variable.name', function (val) {
      $scope.variable.name = $filter('uppercase')(val);
  }, true);

    $scope.variable={};
    $scope.variable.query='';

    $scope.create = function(){

        Templates.selected.variables.push($scope.variable);
        Templates.update(Templates.selected).success(function (template){
            Templates.selected = template;
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
