'use strict';

angular.module('templates').directive('createTemplate', CreateTemplateDirective);

function ConfigurationDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'public/modules/templates/views/create-template-directive.client.view.html',
    controller: CreateTemplateDirectiveController
  };

  return directive;

  /* @ngInject */
  function CreateTemplateDirectiveController ($scope, $state, Templates) {

    $scope.create = function(template) {

      Templates.create(template).then(function (template) {

        Templates.selected = template;
        $state.go()

      });
    }

  }
}
