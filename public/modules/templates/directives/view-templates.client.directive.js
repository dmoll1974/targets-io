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

    Templates.getAll().success(function(templates){

      $scope.templates = templates;

    });

    $scope.importTemplate = function () {
      $state.go('importTemplate');
    };

    var originatorEv;

    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);

    };


    $scope.viewTemplate = function(index){

        $state.go('viewTemplate', {templateName: $scope.templates[index].name})
    }

    $scope.addTemplate = function (){

      /* reset Templates.selected */
      Templates.selected = {};
      $state.go('addTemplate');
    };

    $scope.$watch('allTemplatesSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.templates, function (template, i) {
          template.selected = newVal;
        });
      }
    });

    $scope.setTemplatesSelected = function(templateSelected){

      if (templateSelected === false){

        $scope.templateSelected = false;

        _.each($scope.templates, function(template){
          if(template.selected === true) $scope.templateSelected = true;
        })

      }else {
        $scope.templateSelected = templateSelected;
      }
    };

    $scope.setAllTemplatesSelected = function(templateSelected){

      $scope.templateSelected = templateSelected;
    };

    $scope.openDeleteSelectedTemplatesModal = function (size) {

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
