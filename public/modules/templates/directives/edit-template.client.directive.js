'use strict';

angular.module('templates').directive('editTemplate', EditTemplateDirective);

function EditTemplateDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/edit-template.client.view.html',
    controller: EditTemplateDirectiveController//,
    //controllerAs: 'ctrlEditTemplate'
  };

  return directive;

  /* @ngInject */
  function EditTemplateDirectiveController ($scope, $rootScope, $state, Templates, $filter) {

      $scope.update = update;
      $scope.cancel = cancel;

          /* Watches */

      $scope.$watch('template.name', function (val) {
          $scope.template.name = $filter('uppercase')(val);
      }, true);


      /* activate */

      activate();

      /* functions */

      function activate() {

          $scope.template = Templates.selected;

      }

      function update(){

          Templates.update($scope.template).success(function (template){
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
