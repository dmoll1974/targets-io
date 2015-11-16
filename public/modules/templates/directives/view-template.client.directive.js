'use strict';

angular.module('templates').directive('viewTemplate', ViewTemplateDirective);

function ViewTemplateDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/view-template.client.view.html',
    controller: ViewTemplateDirectiveController//,
    //controllerAs: 'ctrlTemplate'
  };

  return directive;

  /* @ngInject */
  function ViewTemplateDirectiveController ($scope, $state, $stateParams, Templates, Dashboards) {

    /* Watch on dashboard */
    $scope.$watch(function (scope) {
      return Templates.selected;
    }, function () {
      $scope.template = Templates.selected;
    });




  }
}
