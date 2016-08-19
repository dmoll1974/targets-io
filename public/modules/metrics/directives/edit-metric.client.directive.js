'use strict';

angular.module('metrics').directive('editMetric', EditMetricDirective);

function EditMetricDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/metrics/directives/edit-metric.client.view.html',
    controller: EditMetricDirectiveController,
    controllerAs: 'vm'
  };

  return directive;

  /* @ngInject */
  function EditMetricDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, Templates, Metrics, ConfirmModal, $modal, $q, $timeout, $mdToast, TestRuns, mySocket ) {

    var vm = this;

    activate();

    vm.productName = $stateParams.productName;
    vm.dashboardName = $stateParams.dashboardName;

    /* values for form drop downs*/
    vm.metricTypes = Metrics.metricTypes;
    vm.metricUnits = Metrics.metricUnits;
    vm.operatorOptions = Metrics.operatorOptions;
    vm.deviationOptions = Metrics.deviationOptions;
    vm.progress = undefined;

    vm.dashboard = Dashboards.selected;
    
    vm.addTarget = addTarget;
    vm.removeTarget = removeTarget;
    vm.duplicateTarget = duplicateTarget;
    vm.addCustomUnit = addCustomUnit;
    vm.loadTags = loadTags;
    vm.clone = clone;
    vm.openDeleteConfirmation = openDeleteConfirmation;
    vm.update = update;
    vm.cancel = cancel;

    /* watches*/

    $scope.$watch('vm.enableRequirement', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (vm.enableRequirement === false) {
          vm.metric.requirementOperator = null;
          vm.metric.requirementValue = null;
        }
      }
    });
    $scope.$watch('vm.enableBenchmarking', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (vm.enableBenchmarking === false) {
          vm.metric.benchmarkOperator = null;
          vm.metric.benchmarkValue = null;
        }
      }
    });

    /*socket.io*/

    var room = $stateParams.productName + '-' + $stateParams.dashboardName;


    mySocket.emit('room', room);
    console.log('Joined room: ' + room);


    mySocket.on('progress', function (message) {

      vm.progress = (message.progress < 100) ? message.progress : undefined ;
    });




    $scope.$on('$destroy', function () {
      //  leave the room
      mySocket.emit('exit-room', room);
    });


    function addCustomUnit(){

      vm.metricUnits.push(vm.metric.customUnit)
      vm.metric.unit = vm.metric.customUnit;

    }

    function addTarget() {
      vm.metric.targets.push('');
      vm.graphiteTargets = vm.defaultGraphiteTargets;
    };
    
    function removeTarget(index) {
      vm.metric.targets.splice(index, 1);
    };

    function duplicateTarget(index){

      vm.metric.targets.push(vm.metric.targets[index]);
    }

    function loadTags(query) {
      var matchedTags = [];
      _.each(Dashboards.selected.tags, function (tag) {
        if (tag.text.toLowerCase().match(query.toLowerCase()))
          matchedTags.push(tag);
      });
      return matchedTags;
    };

// Update existing Metric
    function update() {
      /* Update tags in Dashboard if any new are added */
      Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, vm.metric.tags, function (tagsUpdated) {

        if (tagsUpdated)
          Dashboards.update(Dashboards.selected).success(function (dashboard) {
          });
      });

      vm.metric.productName = $stateParams.productName;
      vm.metric.dashboardName = $stateParams.dashboardName;



      Metrics.update(vm.metric).success(function (metric) {

        var updateIndex = Dashboards.selected.metrics.map(function(metric){ metric._id}).indexOf(vm.metric._id);
        Dashboards.selected.metrics[updateIndex] = vm.metric;

        Dashboards.update(Dashboards.selected).success(function (dashboard) {
        });


        var updateRequirements = vm.currentRequirement !== metric.requirementOperator + metric.requirementValue ? true : false;
        var updateBenchmarks = vm.currentBenchmark !== metric.benchmarkOperator + metric.benchmarkValue ? true : false;

        /* if requirement or benchmark vlaues have changed, update test runs */
        if (updateRequirements || (updateBenchmarks && Dashboards.selected.useInBenchmark )) {

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('bottom center')
              .hideDelay(3000);

          $mdToast.show(toast.content('Test runs are being updated, this might take a while ...')).then(function(response) {

          });

          vm.progress = 0;

          TestRuns.updateTestruns($stateParams.productName, $stateParams.dashboardName).success(function (testRuns) {
            TestRuns.list = testRuns;

            if ($rootScope.previousStateParams)
              $state.go($rootScope.previousState, $rootScope.previousStateParams);
            else
              $state.go($rootScope.previousState);
          });
        } else {
        if ($rootScope.previousStateParams)
          $state.go($rootScope.previousState, $rootScope.previousStateParams);
        else
          $state.go($rootScope.previousState);
        }
      });
    };

    // Find existing Metric
    function activate () {
      Metrics.get($stateParams.metricId).success(function (metric) {

        vm.metric = metric;

        /* if metric has custom unit, add it to the select list */

        if(vm.metricUnits.indexOf(vm.metric.unit ) === -1){
          vm.metricUnits.unshift(vm.metric.unit);
        }

        /* set benchmark and requirement toggles */
        if (vm.metric.requirementValue !== null)
          vm.enableRequirement = true;
        if (vm.metric.benchmarkValue !== null)
          vm.enableBenchmarking = true;
        /* set current requirements */
        vm.currentRequirement = metric.requirementOperator + metric.requirementValue;
        /* set current benchmark values */
        vm.currentBenchmark = metric.benchmarkOperator + metric.benchmarkValue;
      });
    };
    
    function clone() {

      Metrics.clone = vm.metric;

      delete Metrics.clone['_id'];
      Metrics.clone.dashboardId = Dashboards.selected._id;

      $state.go('addMetric', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName
      });
    };
    
     function openDeleteConfirmation(size, index) {
      Metrics.selected = vm.metric;
      ConfirmModal.itemType = 'Delete metric ';
      ConfirmModal.selectedItemId = vm.metric._id;
      ConfirmModal.selectedItemDescription = vm.metric.alias;
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function (metricId) {
        Metrics.delete(metricId).success(function (metric) {
          /* refresh dashboard*/
          Dashboards.get(vm.productName, vm.dashboardName).success(function (dashboard) {
            vm.dashboard = Dashboards.selected;
            /* return to previous state*/
            $state.go($rootScope.previousState, $rootScope.previousStateParams);
          });
        });
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
    function cancel() {
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };
  }
}
