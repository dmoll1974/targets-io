'use strict';

angular.module('templates').directive('templateVariables', TemplateVariablesDirective);

function TemplateVariablesDirective () {

  var directive = {

    restrict: 'EA',
    templateUrl: 'modules/templates/directives/view-template-variables.client.view.html',
    controller: TemplateVariablesDirectiveController,
    controllerAs: 'ctrlTemplateVariables'
  };

  return directive;

  /* @ngInject */
  function TemplateVariablesDirectiveController ($scope, $state, Templates, ConfirmModal, $modal) {


      $scope.addVariable = function(){

        $state.go('addVariable');

      };

    $scope.editVariable = function(index){

      Templates.variable = Templates.selected.variables[index];
      $state.go('editTemplateVariable', {variableId: Templates.variable._id});
    }


    $scope.$watch('allVariablesSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.template.variables, function (variable, i) {
          variable.selected = newVal;
        });
      }
    });

    $scope.setVariablesSelected = function(variableSelected){

      if (variableSelected === false){

        $scope.variableSelected = false;

        _.each($scope.template.variables, function(variable){
          if(variable.selected === true) $scope.variableSelected = true;
        })

      }else {
        $scope.variableSelected = variableSelected;
      }
    };

    $scope.setAllVariablesSelected = function(variableSelected){

      $scope.variableSelected = variableSelected;
    };

    $scope.openDeleteSelectedVariablesModal = function (size) {

      ConfirmModal.itemType = 'Delete ';
      ConfirmModal.selectedItemId = '';
      ConfirmModal.selectedItemDescription = 'selected variables';
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        var deleteVariableIdsArray = [];
        var i;

        for(i = $scope.template.variables.length -1; i > -1; i--){

          if($scope.template.variables[i].selected === true){
            deleteVariableIdsArray.push($scope.template.variables[i]._id);
            $scope.template.variables[i].selected = false;
            $scope.variableSelected = false;
            $scope.template.variables.splice(i,1);
          }
        }


        Templates.update($scope.template).success(function (template){
          Templates.selected = template;
        });

      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });

    };
  }
}
