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
  function DashboardMetricsDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, Templates, Metrics, Utils, ConfirmModal, $modal, $q, $timeout, TestRuns, mySocket, $mdToast,$mdDialog) {

    var vm = this;

    activate();

    vm.productName = $stateParams.productName;
    vm.dashboardName = $stateParams.dashboardName;
    vm.sortType     = Utils.sortType; // set the default sort type
    vm.sortReverse  = Utils.sortReverse;  // set the default sort order
    vm.dashboard = Dashboards.selected;
    vm.metricFilter = Metrics.metricFilter;
    vm.addMetric = addMetric;
    vm.addMetricFromTemplate = addMetricFromTemplate;
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
    vm.searchAndReplace = searchAndReplace;

    //vm.filterTemplates = filterTemplates;

    vm.metricSelected = false;
    vm.progress = undefined;
    vm.showTemplates = false;
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

    $scope.$watch('vm.sortType', function (newVal, oldVal) {
      if (newVal !== oldVal) {

        Utils.sortType = vm.sortType;
      }
    });

    $scope.$watch('vm.sortReverse', function (newVal, oldVal) {
      if (newVal !== oldVal) {

        Utils.sortReverse = vm.sortReverse;
      }
    });

      $scope.$watch('vm.allMetricsSelected', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          _.each(vm.filteredMetrics, function (metric, i) {
            metric.selected = newVal;
          });
        }
      });

    $scope.$watch('templateSearchText', function (val) {
      $scope.templateSearchText = $filter('uppercase')(val);
    }, true);




    /* Watch on dashboard id */
      //$scope.$watch(function (scope) {
      //  return Dashboards.selected._id;
      //}, function (newVal, oldVal) {
      //  if(newVal !== oldVal){
      //
      //    $timeout(function(){
      //
      //      vm.dashboard = Dashboards.selected;
      //      vm.metricFilter = '';
      //
      //    }, 100);
      //  }
      //
      //});

    /* Watch on dashboard id */
    $scope.$watch(function (scope) {
      return Dashboards.selected.metrics;
    }, function (newVal, oldVal) {
      if(newVal !== oldVal){

        vm.dashboard = Dashboards.selected;

      }

    }, true);


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

    /* initialise view */

    function activate() {
      /* Get all dashboard names for product */

      Dashboards.getDashboardsForProduct($stateParams.productName).success(function (dashboards) {

        vm.dashboardsForProduct = dashboards;

      });

      Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {
        vm.dashboard = dashboard;
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
            });
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

        //vm.metricSelected = metricSelected;

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


      function mergeTemplate(template) {

        if(template){

          vm.showTemplates = false;
          $state.go('mergeTemplate',{templateName: template.name});

        }

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

    function searchAndReplace($event){

      var selectedMetrics = [];

      _.each(vm.filteredMetrics, function (metric) {

        if (metric.selected === true) {

          selectedMetrics.push(metric);
        }

      })

      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        templateUrl:'modules/metrics/views/search.and.replace.client.view.html',
        locals: {
          selectedMetrics: selectedMetrics
        },
        controller: DialogController
      });
      function DialogController($scope, $mdDialog, selectedMetrics) {

        $scope.selectedMetrics = selectedMetrics;
        $scope.replaceInAlias = true;
        $scope.replaceInTargets = true;


        $scope.closeDialogCancel = function(){

          $mdDialog.hide();

        }

        $scope.closeDialogOK = function(){

          var updateMetricArrayOfPromises = [];
          var searchRegExp = new RegExp($scope.search, 'g');

          _.each($scope.selectedMetrics, function (metric) {

           if($scope.replaceInAlias) metric.alias = metric.alias.replace(searchRegExp, $scope.replace);

              _.each(metric.targets, function(target, i){

                if($scope.replaceInTargets) metric.targets[i] = target.replace(searchRegExp, $scope.replace);

              })

            updateMetricArrayOfPromises.push(Metrics.update(metric));


          })

          $q.all(updateMetricArrayOfPromises)
              .then(function () {
                $mdDialog.hide();

                //$state.go('viewDashboard', {
                //  productName: $stateParams.productName,
                //  dashboardName: dashboard.name
                //});
              });


        }


      }


    }
    function addMetricFromTemplate($event, templates){

        var parentEl = angular.element(document.body);
        $mdDialog.show({
          parent: parentEl,
          targetEvent: $event,
          templateUrl: 'modules/metrics/views/templates.client.view.html',
          locals: {
            templates: templates
          },
          controller: DialogController
        });
        function DialogController($scope, $mdDialog, templates) {

          $scope.templates = templates;


          $scope.closeDialog = function(){

            $mdDialog.hide();

          }

          $scope.mergeTemplate = function (template) {

            if(template){

              vm.showTemplates = false;
              $state.go('mergeTemplate',{templateName: template.name});
              $mdDialog.hide();
            }



          }
          $scope.filterTemplates = function(query) {

            var results = query ? vm.templates.filter( createFilterForTemplates(query) ) : vm.templates;

            return results;

          }

          function createFilterForTemplates(query) {
            var upperCaseQuery = angular.uppercase(query);
            return function filterFn(template) {
              return (template.name.toUpperCase().indexOf(upperCaseQuery) !== -1 || template.description.toUpperCase().indexOf(upperCaseQuery) !== -1 );
            };
          }

        }

      /* set focus */

      setTimeout(function(){
        document.querySelector('#selectTemplateAutoComplete').focus();
      },200);

    }



    function cancel() {
        if ($rootScope.previousStateParams)
          $state.go($rootScope.previousState, $rootScope.previousStateParams);
        else
          $state.go($rootScope.previousState);
      };
    }
}
