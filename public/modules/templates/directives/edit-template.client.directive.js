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

  $scope.$watch('template.name', function (val) {
      $scope.template.name = $filter('uppercase')(val);
  }, true);

      $scope.template = Templates.selected;

      $scope.update = function(){

          Templates.update($scope.template).success(function (template){
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
