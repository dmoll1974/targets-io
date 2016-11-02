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

    $scope.moveUp = moveUp;
    $scope.addVariable = addVariable;
    $scope.editVariable = editVariable;
    $scope.setVariablesSelected = setVariablesSelected;
    $scope.setAllVariablesSelected = setAllVariablesSelected;
    $scope.openDeleteSelectedVariablesModal = openDeleteSelectedVariablesModal;

      /* Watches */

    $scope.$watch('allVariablesSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.template.variables, function (variable, i) {
          variable.selected = newVal;
        });
      }
    });


    /* functions */


    function moveUp(index){

        var tempArrayItem = $scope.template.variables[index -1];
        $scope.template.variables[index -1] = $scope.template.variables[index];
        $scope.template.variables[index] = tempArrayItem;

        Templates.update($scope.template).success(function (template){
          Templates.selected = template;
        });

    };


    function addVariable(){

        $state.go('addVariable');

    };

    function editVariable(index){

      Templates.variable = Templates.selected.variables[index];
      $state.go('editTemplateVariable', {variableId: Templates.variable._id});
    }



    function setVariablesSelected(variableSelected){

      if (variableSelected === false){

        $scope.variableSelected = false;

        _.each($scope.template.variables, function(variable){
          if(variable.selected === true) $scope.variableSelected = true;
        })

      }else {
        $scope.variableSelected = variableSelected;
      }
    };

    function setAllVariablesSelected(variableSelected){

      $scope.variableSelected = variableSelected;
    };

    function openDeleteSelectedVariablesModal(size) {

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
