'use strict';

angular.module('dashboards').directive('manageDashboardTags', ManageDashboardTagsDirective);

function ManageDashboardTagsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/dashboards/directives/view-dashboard-tags.client.view.html',
    controller: ManageDashboardTagsDirectiveController//,
    //controllerAs: 'ctrlTemplate'
  };

  return directive;

  /* @ngInject */
  function ManageDashboardTagsDirectiveController ($scope, $state, $stateParams, Templates, Dashboards, ConfirmModal, $modal, $q) {

    $scope.productName = $stateParams.productName;
    $scope.dashboardName = $stateParams.dashboardName;

    $scope.tags = Dashboards.selected.tags;
    $scope.defaultTag = Dashboards.getDefaultTag(Dashboards.selected.tags);

    $scope.$watch('allTagsSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.tags, function (tag, i) {
          tag.selected = newVal;
        });
      }
    });

    $scope.setTagsSelected = function(tagSelected){

      if (tagSelected === false){

        $scope.tagSelected = false;

        _.each($scope.tags, function(tag){
          if(tag.selected === true) $scope.tagSelected = true;
        })

      }else {
        $scope.tagSelected = tagSelected;
      }
    };

    $scope.setAllTagsSelected = function(tagSelected){

      $scope.tagSelected = tagSelected;
    };


    //$scope.$watch(function (scope) {
    //  return Dashboards.selected._id;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //    $scope.tags = Dashboards.selected.tags;
    //    $scope.defaultTag = Dashboards.getDefaultTag(Dashboards.selected.tags);
    //    //setDefault($scope.defaultTag);
    //    //Dashboards.update().success(function (dashboard) {
    //    //  $scope.tags = dashboard.tags;
    //    //});
    //  }
    //});
    $scope.$watch('defaultTag', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        setDefault($scope.defaultTag);
        Dashboards.update().success(function (dashboard) {
          Dashboards.selected = dashboard;
          $scope.tags = Dashboards.selected.tags;
        });
      }
    });
    function setDefault(newDefaultTag) {
      _.each(Dashboards.selected.tags, function (tag, i) {
        if (tag.text === newDefaultTag) {
          Dashboards.selected.tags[i].default = true;
        } else {
          Dashboards.selected.tags[i].default = false;
        }
      });
    }
    $scope.openDeleteSelectedTagsModal = function (size) {

      ConfirmModal.itemType = 'Delete ';
      ConfirmModal.selectedItemId = '';
      ConfirmModal.selectedItemDescription = 'selected tags';
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        var i;
        for(i = $scope.tags.length -1; i > -1; i--){

          if($scope.tags[i].selected === true){
            $scope.tags[i].selected = false;
            Dashboards.selected.tags.splice(i, 1);
            _.each(Dashboards.selected.metrics, function (metric) {
              Metrics.removeTag(metric._id, $scope.tags[i].text);
            });

          }
        }


        Dashboards.update().success(function (dashboard) {
          $scope.tags = dashboard.tags;
          Dashboards.selected = dashboard;

        });

      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });

    };

  }
}
