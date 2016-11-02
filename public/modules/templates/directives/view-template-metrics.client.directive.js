'use strict';

angular.module('templates').directive('templateMetrics', TemplateMetricsDirective);

function TemplateMetricsDirective () {

  var directive = {

    restrict: 'EA',
    templateUrl: 'modules/templates/directives/view-template-metrics.client.view.html',
    controller: TemplateMetricsDirectiveController
  };

  return directive;

  /* @ngInject */
  function TemplateMetricsDirectiveController ($scope, $state, Templates, ConfirmModal, $modal) {


    $scope.addMetric = addMetric;
    $scope.editMetric = editMetric;
    $scope.clearMetricFilter = clearMetricFilter;
    $scope.setMetricsSelected = setMetricsSelected;
    $scope.setAllMetricsSelected = setAllMetricsSelected;
    $scope.orderByTags = orderByTags;
    $scope.openDeleteSelectedMetricsModal = openDeleteSelectedMetricsModal;

    /* Watches */

    $scope.$watch('allMetricsSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.template.metrics, function (metric, i) {
          metric.selected = newVal;
        });
      }
    });

    /* activate */

    activate();

    /* functions */

    function activate() {

      $scope.sortType = 'orderByTags'; // set the default sort type
      $scope.sortReverse = false;  // set the default sort order
      $scope.searchMetrics = ''; // set the default sort order

    }

    function addMetric(){

        $state.go('addTemplateMetric');
    };

    function editMetric(index){

      Templates.metric = Templates.selected.metrics[index];
      $state.go('editTemplateMetric', {metricId: Templates.metric._id});
    }


    function clearMetricFilter(){

      $scope.filterMetrics = '';
    }

    function setMetricsSelected(metricSelected){

      if (metricSelected === false){

        $scope.metricSelected = false;

        _.each($scope.template.metrics, function(metric){
          if(metric.selected === true) $scope.metricSelected = true;
        })

      }else {
        $scope.metricSelected = metricSelected;
      }
    };

    function setAllMetricsSelected(metricSelected){

      $scope.metricSelected = metricSelected;
    };

    function orderByTags(metric){

      return metric.tags[0].text;
    };

    function openDeleteSelectedMetricsModal(size) {

      ConfirmModal.itemType = 'Delete ';
      ConfirmModal.selectedItemId = '';
      ConfirmModal.selectedItemDescription = 'selected metrics';
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        var deleteMetricIdsArray = [];
        var i;

        for(i = $scope.template.metrics.length -1; i > -1; i--){

          if($scope.template.metrics[i].selected === true){
            deleteMetricIdsArray.push($scope.template.metrics[i]._id);
            $scope.template.metrics[i].selected = false;
            $scope.metricSelected = false;
            $scope.template.metrics.splice(i,1);
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
