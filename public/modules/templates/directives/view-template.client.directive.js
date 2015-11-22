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
  function ViewTemplateDirectiveController ($scope, $state, $stateParams, Templates, Dashboards, Utils) {

    /* Watch on template */
    //$scope.$watch(function (scope) {
    //  return Templates.selected;
    //}, function () {
    //  $scope.template = Templates.selected;
    //});


  /* Tab controller*/
    $scope.selectedIndex = Templates.selected.selectedIndex || 0;

    $scope.setTab = function (newValue) {
      Templates.selected.selectedIndex = newValue;
    };

  Templates.get($stateParams.templateName).success(function(template){

    /* sort template metrics by tag[0]*/
    template.metrics = template.metrics.sort(Utils.dynamicSortTags(''));

    $scope.template = template;
      Templates.selected = template;

  });

  }
}
