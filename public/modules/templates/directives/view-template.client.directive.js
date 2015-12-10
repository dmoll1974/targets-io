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

    $scope.clone = function(){

      Templates.templateClone = _.clone(Templates.selected);
      Templates.templateClone.name += '-CLONE';
      Templates.templateClone._id = undefined;
      $state.go('addTemplate');

    };
  $scope.edit = function(){

    $state.go('editTemplate', {templateName: Templates.selected.name});

  };
    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

  }
}
