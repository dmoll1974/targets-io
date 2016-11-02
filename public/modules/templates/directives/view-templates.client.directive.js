'use strict';

angular.module('templates').directive('viewTemplates', ViewTemplatesDirective);

function ViewTemplatesDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/view-templates.client.view.html',
    controller: ViewTemplatesDirectiveController//,
    //controllerAs: 'ctrlTemplate'
  };

  return directive;

  /* @ngInject */
  function ViewTemplatesDirectiveController ($scope, $state, $stateParams, Templates, Dashboards, ConfirmModal, $modal, $q) {


    $scope.importTemplate = importTemplate;
    $scope.openMenu = openMenu;
    $scope.viewTemplate = viewTemplate;
    $scope.addTemplate = addTemplate;
    $scope.setTemplatesSelected = setTemplatesSelected;
    $scope.setAllTemplatesSelected = setAllTemplatesSelected;
    $scope.openDeleteSelectedTemplatesModal = openDeleteSelectedTemplatesModal;

    /* Watches */

    $scope.$watch('allTemplatesSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.templates, function (template, i) {
          template.selected = newVal;
        });
      }
    });

    /* activate */

    activate();

    /* functions */

    function activate() {

      Templates.getAll().success(function (templates) {

        $scope.templates = templates;

      });
    }

    function importTemplate() {
      $state.go('importTemplate');
    };

    var originatorEv;

    function openMenu($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);

    };


    function viewTemplate(index){

        $state.go('viewTemplate', {templateName: $scope.templates[index].name})
    }

    function addTemplate(){

      /* reset Templates.selected */
      Templates.selected = {};
      $state.go('addTemplate');
    };


    function setTemplatesSelected(templateSelected){

      if (templateSelected === false){

        $scope.templateSelected = false;

        _.each($scope.templates, function(template){
          if(template.selected === true) $scope.templateSelected = true;
        })

      }else {
        $scope.templateSelected = templateSelected;
      }
    };

    function setAllTemplatesSelected(templateSelected){

      $scope.templateSelected = templateSelected;
    };

    function openDeleteSelectedTemplatesModal(size) {

      ConfirmModal.itemType = 'Delete ';
      ConfirmModal.selectedItemId = '';
      ConfirmModal.selectedItemDescription = 'selected templates';
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        var deleteTemplateArrayOfPromises = [];
        var i;

        for(i = $scope.templates.length -1; i > -1; i--){

          if($scope.templates[i].selected === true){
            deleteTemplateArrayOfPromises.push(Templates.delete($scope.templates[i]._id));
            $scope.templates[i].selected = false;
            $scope.templateSelected = false;
            $scope.templates.splice(i,1);
          }
        }


        $q.all(deleteTemplateArrayOfPromises)
            .then( Templates.getAll())
            .success(function (templates) {
              $scope.templates = templates;
            });

      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });

    };

  }
}
