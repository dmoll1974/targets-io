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
  function ViewTemplateDirectiveController ($scope, $state, $stateParams, Templates, Dashboards, Utils, $window) {

    $scope.setTab = setTab;
    $scope.backup = backup;
    $scope.clone = clone;
    $scope.edit = edit;
    $scope.openMenu = openMenu;

    /* activate */

    activate();

    /* functions */

    function activate() {

      /* Tab controller*/
      $scope.selectedIndex = Templates.selectedIndex || 0;

      Templates.get($stateParams.templateName).success(function(template){

        /* sort template metrics by tag[0]*/
        template.metrics = template.metrics.sort(Utils.dynamicSortTags(''));

        $scope.template = template;
        Templates.selected = template;

      });

    }

    function setTab(newValue) {
      Templates.selectedIndex = newValue;
    };


    function backup(){

      var url = 'http://' + $window.location.host + '/download-template/' + Templates.selected.name;
      //	$log.log(url);
      $window.location.href = url;
    }

    function clone(){

      Templates.templateClone = _.clone(Templates.selected);
      Templates.templateClone.name += '-CLONE';
      Templates.templateClone._id = undefined;
      $state.go('addTemplate');

    };

  function edit(){

    $state.go('editTemplate', {templateName: Templates.selected.name});

  };

    var originatorEv;
    function openMenu($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

  }
}
