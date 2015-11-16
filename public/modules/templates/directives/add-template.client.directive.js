'use strict';

angular.module('templates').directive('addTemplate', AddTemplateDirective);

function AddTemplateDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/add-template.client.view.html',
    controller: AddTemplateDirectiveController
  };

  return directive;

  /* @ngInject */
  function AddTemplateDirectiveController ($scope, $state, Templates, Dashboards, $filter) {

    $scope.$watch('template.name', function (val) {
      $scope.template.name = $filter('uppercase')(val);
    }, true);


    Templates.selected.name = '';
    Templates.selected.description = '';
    $scope.template = Templates.selected;

    $scope.create = function() {

      Templates.create($scope.template).success(function(template) {

        Templates.selected = template;
        $state.go('viewTemplate',{templateName: template.name});

      });
    }

  }
}
