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
  function AddTemplateDirectiveController ($scope, $state, Templates, Dashboards, $filter, $rootScope) {


    $scope.create = create;
    $scope.cancel = cancel;

      /* Watches */

    $scope.$watch('template.name', function (val) {
      $scope.template.name = $filter('uppercase')(val);
    }, true);


    /* activate */

    activate();

    /* functions */

    function activate() {

      if (Templates.templateClone.name) {
        $scope.template = Templates.templateClone;
        Templates.templateClone = {};

      } else {
        Templates.selected.name = '';
        Templates.selected.description = '';
        $scope.template = Templates.selected;
      }

    }

    function create() {

      Templates.create($scope.template).success(function(template) {

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
