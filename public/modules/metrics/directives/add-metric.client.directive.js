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
  function AddMetricDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, Templates, Metrics, ConfirmModal, $modal, $q, $timeout, mySocket, $mdToast, TestRuns) {

    var vm = this;


    vm.addTarget = addTarget;
    vm.removeTarget = removeTarget;
    vm.duplicateTarget = duplicateTarget;
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



    /* activate */
    activate();

    /* functions */

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
        vm.metric.type = Metrics.clone.type;
        vm.metric.unit = Metrics.clone.unit;
        vm.metric.tags = Metrics.clone.tags;
        vm.enableBenchmarking = Metrics.clone.benchmarkValue ? true : false;
        vm.enableRequirement = Metrics.clone.requirementValue ? true : false;
        vm.metric.includeInSummary = Metrics.clone.includeInSummary;


      }

      vm.productName = $stateParams.productName;
      vm.dashboardName = $stateParams.dashboardName;

      /* values for form drop downs*/
      vm.metricTypes = Metrics.metricTypes
      vm.metricUnits = Metrics.metricUnits;
      vm.operatorOptions = Metrics.operatorOptions;
      vm.deviationOptions = Metrics.deviationOptions;
      vm.progress = undefined;
      vm.triedToSubmit = false;



      vm.dashboard = Dashboards.selected;


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

      Metrics.create(vm.metric).success(function (metric) {

        /* reset cloned metric */
        Metrics.clone = undefined;

        var updateRequirements = metric.requirementOperator && metric.requirementValue ? true : false;
        var updateBenchmarks = metric.benchmarkOperator && metric.benchmarkValue ? true : false;
        /* if requirement or benchmark values have changed, update test runs */
        if (updateRequirements || (updateBenchmarks && Dashboards.selected.useInBenchmark )) {

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('bottom center')
              .hideDelay(3000);

          $mdToast.show(toast.content('Test runs are being updated, this might take a while ...')).then(function(response) {
            vm.progress = 0;

         });

         TestRuns.updateTestruns($stateParams.productName, $stateParams.dashboardName).success(function (testRuns) {
            TestRuns.list = testRuns;
            vm.progress = undefined;

           mySocket.emit('exit-room', room);

           $state.go('viewDashboard', {productName:  $stateParams.productName, dashboardName: $stateParams.dashboardName});

         });
        }else{

          mySocket.emit('exit-room', room);

          $state.go('viewDashboard', {productName:  $stateParams.productName, dashboardName: $stateParams.dashboardName});

        }



      });

    };

    function cancel() {

      mySocket.emit('exit-room', room);

      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };
  }
}
