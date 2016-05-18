'use strict';

angular.module('metrics').directive('addMetric', AddMetricDirective);

function AddMetricDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/metrics/directives/add-metric.client.view.html',
    controller: AddMetricDirectiveController,
    controllerAs: 'vm'
  };

  return directive;

  /* @ngInject */
  function AddMetricDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, Templates, Metrics, ConfirmModal, $modal, $q, $timeout) {

    var vm = this;

    activate();

    vm.productName = $stateParams.productName;
    vm.dashboardName = $stateParams.dashboardName;

    /* values for form drop downs*/
    vm.metricTypes = Metrics.metricTypes
    vm.metricUnits = Metrics.metricUnits;
    vm.operatorOptions = Metrics.operatorOptions;
    vm.deviationOptions = Metrics.deviationOptions;

    vm.dashboard = Dashboards.selected;

    vm.addTarget = addTarget;
    vm.removeTarget = removeTarget;
    vm.addCustomUnit = addCustomUnit;
    vm.loadTags = loadTags;
    vm.create = create;
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

    function activate(){

      if(Metrics.clone === undefined){

        vm.metric = {};
        vm.metric.dashboardId = Dashboards.selected._id;
        vm.metric.targets = [];
        vm.metric.targets.push('');
        vm.enableBenchmarking = false;
        vm.enableRequirement = false;
        vm.metric.includeInSummary = false;


      }else{

        vm.metric = Metrics.clone;
        vm.metric.targets = Metrics.clone.targets;
        vm.enableBenchmarking = Metrics.clone.benchmarkValue ? true : false;
        vm.enableRequirement = Metrics.clone.requirementValue ? true : false;
        vm.metric.includeInSummary = Metrics.clone.includeInSummary;


      }
    }

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
    
    function loadTags(query) {
      var matchedTags = [];
      _.each(Dashboards.selected.tags, function (tag) {
        if (tag.text.toLowerCase().match(query.toLowerCase()))
          matchedTags.push(tag);
      });
      return matchedTags;
    };

    // Create new Metric
    function create() {

      /* Update tags in Dashboard if any new are added */
      Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, vm.metric.tags, function (tagsUpdated) {

        if (tagsUpdated)
          Dashboards.update(Dashboards.selected).success(function (dashboard) {
          });
      });

      vm.metric.productName = $stateParams.productName;
      vm.metric.dashboardName = $stateParams.dashboardName;
      //vm.currentRequirement = '';
      //vm.currentBenchmark = '';

      Metrics.create(vm.metric).success(function (metric) {

        /* reset cloned metric */
        Metrics.clone = undefined;

        //var updateRequirements = vm.currentRequirement !== metric.requirementOperator + metric.requirementValue ? true : false;
        //var updateBenchmarks = vm.currentBenchmark !== metric.benchmarkOperator + metric.benchmarkValue ? true : false;
        /* if requirement or benchmark values have changed, update test runs */
        //if (updateRequirements || (updateBenchmarks && Dashboards.selected.useInBenchmark )) {
        //
        //  var toast = $mdToast.simple()
        //      .action('OK')
        //      .highlightAction(true)
        //      .position('top center')
        //      .hideDelay(3000);
        //
        //  $mdToast.show(toast.content('Test runs are being updated, this might take a while ...')).then(function(response) {

        //});
        //vm.updateTestrun = TestRuns.updateTestruns($stateParams.productName, $stateParams.dashboardName, metric._id, updateRequirements, updateBenchmarks).success(function (testRuns) {
        //  TestRuns.list = testRuns;
        //});
        //}

        $state.go('viewDashboard', {productName:  $stateParams.productName, dashboardName: $stateParams.dashboardName});

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
