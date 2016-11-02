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


      $scope.create = create;
      $scope.cancel = cancel;

          /* Watches */

      $scope.$watch('variable.name', function (val) {
          $scope.variable.name = $filter('uppercase')(val);
      }, true);


      /* activate */

      activate();

      /* functions */

      function activate() {

          $scope.variable = {};
          $scope.variable.query = '';
      }

    function create(){

        $scope.variable.placeholder = '$' + $scope.variable.name;
        Templates.selected.variables.push($scope.variable);
        Templates.update(Templates.selected).success(function (template){
            Templates.selected = template;
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
