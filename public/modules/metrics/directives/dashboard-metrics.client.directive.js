'use strict';

angular.module('metrics').directive('dashboardMetrics', DashboardMetricsDirective);

function DashboardMetricsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/metrics/directives/dashboard-metrics.client.view.html',
    controller: DashboardMetricsDirectiveController,
    controllerAs: 'vm'
  };

  return directive;

  /* @ngInject */
  function DashboardMetricsDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, Templates, Metrics, ConfirmModal, $modal, $q, $timeout) {

    var vm = this;

    activate();

    vm.productName = $stateParams.productName;
    vm.dashboardName = $stateParams.dashboardName;
    vm.sortType     = 'tags[0].text'; // set the default sort type
    vm.sortReverse  = false;  // set the default sort order
    vm.dashboard = Dashboards.selected;
    vm.metricFilter = Metrics.metricFilter;
    vm.addMetric = addMetric;
    vm.editMetric = editMetric;
    vm.openDeleteSelectedMetricsModal = openDeleteSelectedMetricsModal;
    vm.setMetricsSelected = setMetricsSelected;
    vm.setAllMetricsSelected = setAllMetricsSelected;
    vm.mergeTemplate = mergeTemplate;
    vm.copyMetricsToDashboard = copyMetricsToDashboard;
    vm.clearMetricFilter = clearMetricFilter;
    vm.cancel = cancel;
    vm.openMenu = openMenu;
    vm.metricsInTestRunSummary = metricsInTestRunSummary;
    vm.resetAllBenchmarks = resetAllBenchmarks;
    vm.metricSelected = false;

    var originatorEv;

    function openMenu ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);

    };




    /* watches*/

      $scope.$watch(function () {
        vm.filteredMetrics = $scope.$eval("vm.dashboard.metrics | filter:vm.metricFilter");
      });


    $scope.$watch('vm.metricFilter', function (newVal, oldVal) {
      if (newVal !== oldVal) {

        Metrics.metricFilter = vm.metricFilter;
      }
    });

      $scope.$watch('vm.allMetricsSelected', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          _.each(vm.filteredMetrics, function (metric, i) {
            metric.selected = newVal;
          });
        }
      });



      /* Watch on dashboard id */
      $scope.$watch(function (scope) {
        return Dashboards.selected._id;
      }, function (newVal, oldVal) {
        if(newVal !== oldVal){

          $timeout(function(){

            vm.dashboard = Dashboards.selected;
            vm.metricFilter = '';

          });
        }

      });

    /* Watch on dashboard id */
    $scope.$watch(function (scope) {
      return Dashboards.selected.metrics;
    }, function (newVal, oldVal) {
      if(newVal !== oldVal){

        vm.dashboard = Dashboards.selected;

      }

    }, true);

    /* initialise view */

    function activate() {
      /* Get all dashboard names for product */

      Dashboards.getDashboardsForProduct($stateParams.productName).success(function (dashboards) {

        vm.dashboardsForProduct = dashboards;

      });


      /* Get templates */

      Templates.getAll().success(function (templates) {

        vm.templates = templates;

      });

    }

    function metricsInTestRunSummary(value){

      var metricsToUpdate = [];

      _.each(vm.filteredMetrics, function(metric, i){

        if(metric.selected === true){

          metric.includeInSummary = value;
          metricsToUpdate.push(Metrics.update(metric));


        }
      });

      $q.all(metricsToUpdate)
          .then(Dashboards.get(vm.productName, vm.dashboardName))
          .then(function () {
            vm.allMetricsSelected = false;
            vm.dashboard = Dashboards.selected;

          });

    }

    function resetAllBenchmarks(){

      var metricsToUpdate = [];

      _.each(vm.filteredMetrics, function(metric, i){

        if(metric.selected === true){

          metric.benchmarkOperator = null;
          metric.benchmarkValue = null;
          metric.requirementOperator = null;
          metric.requirementValue = null;
          metricsToUpdate.push(Metrics.update(metric));


        }
      });

      $q.all(metricsToUpdate)
          .then(Dashboards.get(vm.productName, vm.dashboardName))
          .then(function () {
            vm.allMetricsSelected = false;
            vm.dashboard = Dashboards.selected;
          });

    }

    function addMetric() {
        //            console.log('add/metric/' + $stateParams.productName + '/' + $stateParams.dashboardName)
        $state.go('addMetric', {
          'productName': $stateParams.productName,
          'dashboardName': $stateParams.dashboardName
        });
      };


      function setMetricsSelected(metricSelected) {

        if (metricSelected === false) {

          vm.metricSelected = false;

          _.each(vm.filteredMetrics, function (metric) {
            if (metric.selected === true) vm.metricSelected = true;
          })

        } else {
          vm.metricSelected = metricSelected;
        }
      };

      function setAllMetricsSelected(metricSelected) {

        vm.metricSelected = metricSelected;
      };


      function editMetric(metricId) {

        $state.go('editMetric', {
          productName: $stateParams.productName,
          dashboardName: $stateParams.dashboardName,
          metricId: metricId
        });

      }

      function clearMetricFilter() {

        vm.metricFilter = '';

      };


      function mergeTemplate(index) {

        Templates.selected = vm.templates[index];
        $state.go('mergeTemplate');
      };


      function copyMetricsToDashboard(dashboard) {

        var copyMetricArrayOfPromises = [];

        _.each(vm.filteredMetrics, function (metric) {

          if (metric.selected === true) {
            var metricClone = _.clone(metric);

            metricClone.dashboardId = dashboard._id;
            metricClone.dashboardName = dashboard.name;
            metricClone._id = undefined;


            copyMetricArrayOfPromises.push(Metrics.create(metricClone));
            metric.selected = false;
            vm.metricSelected = false;

          }

        })

        $q.all(copyMetricArrayOfPromises)
            .then(function () {
              $state.go('viewDashboard', {
                productName: $stateParams.productName,
                dashboardName: dashboard.name
              });
            });


      }


      function openDeleteSelectedMetricsModal(size) {

        var numberOfSelected = vm.filteredMetrics.filter(function(metric){
          if(metric.selected === true)
            return metric.selected === true;
        });

        ConfirmModal.itemType = 'Delete ';
        ConfirmModal.selectedItemId = '';
        ConfirmModal.selectedItemDescription = ' selected ' + numberOfSelected.length + ' metrics';
        var modalInstance = $modal.open({
          templateUrl: 'ConfirmDelete.html',
          controller: 'ModalInstanceController',
          size: size  //,
        });
        modalInstance.result.then(function () {
          var deleteMetricArrayOfPromises = [];
          var i;

          for (i = vm.filteredMetrics.length - 1; i > -1; i--) {

            if (vm.filteredMetrics[i].selected === true) {
              deleteMetricArrayOfPromises.push(Metrics.delete(vm.filteredMetrics[i]._id));
              vm.filteredMetrics[i].selected = false;
              vm.metricSelected = false;
              vm.filteredMetrics.splice(i, 1);
            }
          }


          $q.all(deleteMetricArrayOfPromises)
              .then(Dashboards.get(vm.productName, vm.dashboardName))
              .then(function () {
                vm.allMetricsSelected = false;
                vm.dashboard = Dashboards.selected;
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
