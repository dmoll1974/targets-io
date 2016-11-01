'use strict';

angular.module('graphs').directive('graphsContent', GraphsContentDirective);

function GraphsContentDirective () {

  var directive = {
    scope: {
      metric: '=',
      index: '='
    },
    restrict: 'EA',
    templateUrl: 'modules/graphs/directives/graphs-content.client.view.html',
    controller: GraphsContentDirectiveController,
    controllerAs: 'vm'
  };

  return directive;

  /* @ngInject */
  function GraphsContentDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, Utils, Metrics, Tags, $timeout, $mdToast, $mdDialog) {

    var vm = this;


    vm.setMetricShareUrl = setMetricShareUrl;
    vm.editMetric = editMetric;
    vm.loadTags = loadTags;
    vm.setTags = setTags;
    vm.updateTags = updateTags;
    vm.tagRemoved = tagRemoved;
    vm.hasFlash = hasFlash;
    vm.clipClicked =clipClicked;
    vm.toggleTestRunSummary = toggleTestRunSummary;


    activate();

  /* functions*/

    function activate(){

      vm.productName = $stateParams.productName;
      vm.dashboardName = $stateParams.dashboardName;
      vm.graphsType = $state.includes('viewGraphs') ? 'testrun' : 'graphs-live';


    }


    /* generate deeplink to share metric graph */
    function setMetricShareUrl(metric) {

      switch(vm.graphsType){

        case 'graphs-live':

          vm.metricShareUrl = 'http://' + location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName +  '/' + $stateParams.tag +  '/?';

          if (Utils.zoomFrom) {
            vm.metricShareUrl = vm.metricShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
          }

          /* zoom range */
          if (Utils.zoomRange && Utils.zoomRange.label !== 'Since start test run') {
            vm.metricShareUrl = vm.metricShareUrl + '&zoomRange=' + Utils.zoomRange.value;
          }
          vm.metricShareUrl = vm.metricShareUrl + '&metricFilter=' + encodeURIComponent(metric.alias);

          break;

        case 'testrun':

          vm.metricShareUrl = 'http://' + location.host + '/#!/graphs/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.testRunId + '/' + $stateParams.tag +  '/?';


          if (Utils.zoomFrom) {
            vm.metricShareUrl = vm.metricShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
          }
          //if ($state.params.selectedSeries) {
          //  vm.metricShareUrl = vm.metricShareUrl + '&selectedSeries=' + $state.params.selectedSeries;
          //}

          vm.metricShareUrl = vm.metricShareUrl + '&metricFilter=' + encodeURIComponent(metric.alias);

      }


      if (vm.showUrl) {
        switch (vm.showUrl) {
          case true:
            vm.showUrl = false;
            break;
          case false:
            vm.showUrl = true;
            break;
        }
      } else {
        vm.showUrl = true;
      }
    };

    function toggleTestRunSummary(metric, $event){


        var parentEl = angular.element(document.body);

        $mdDialog.show({
          parent: parentEl,
          targetEvent: $event,
          templateUrl:'modules/graphs/views/add.metric.to.summary.client.view.html',
            locals: {
            metric: metric
          },
          controller: DialogController
        });
        function DialogController($scope, $mdDialog, metric, Metrics) {

          $scope.metric = metric;

          $scope.closeDialogCancel = function(){

            $mdDialog.hide();


          }

          $scope.closeDialogOK = function(){

            $scope.metric.includeInSummary = true;

            Metrics.update($scope.metric).success(function () {

              $mdDialog.hide();

              var content = 'Metric has been added to test run summary'
              var toast = $mdToast.simple()
                  .action('OK')
                  .highlightAction(true)
                  .position('bottom center')
                  .hideDelay(3000);

              $mdToast.show(toast.content(content)).then(function(response) {


              })
            })

          }

          $scope.removeFromSummary = function(){

                metric.includeInSummary = false;

                Metrics.update($scope.metric).success(function () {

                  var content = 'Metric has been removed from test run summary';
                  var toast = $mdToast.simple()
                      .action('OK')
                      .highlightAction(true)
                      .position('bottom center')
                      .hideDelay(3000);

                  $mdDialog.hide();

                  $mdToast.show(toast.content(content)).then(function(response) {

                  });


                })
          }

        }

        /* set focus */

        //setTimeout(function(){
        //  document.querySelector('#selectTemplateAutoComplete').focus();
        //},200);



    //}else{
    //
    //    metric.includeInSummary = false;
    //    metric.defaultSummaryText = undefined;
    //
    //    Metrics.update($scope.metric).success(function () {
    //
    //      var content = 'Metric has been removed from test run summary';
    //      var toast = $mdToast.simple()
    //          .action('OK')
    //          .highlightAction(true)
    //          .position('bottom center')
    //          .hideDelay(3000);
    //
    //      $mdToast.show(toast.content(content)).then(function(response) {
    //
    //      });
    //
    //
    //    })
    //  }




    }

    function editMetric(metricId) {
      $state.go('editMetric', {
        productName: $stateParams.productName,
        dashboardName: $stateParams.dashboardName,
        metricId: metricId
      });
    };

    function loadTags(query) {
      var matchedTags = [];
      _.each(Dashboards.selected.tags, function (tag) {
        if (tag.text.toLowerCase().match(query.toLowerCase()))
          matchedTags.push(tag);
      });
      return matchedTags;
    };

    //function updateFilterTags(filterTags, filterOperator, persistTag, callback) {
    //  var combinedTag;
    //  var newTags = [];
    //  _.each(filterTags, function (filterTag, index) {
    //    switch (index) {
    //      case 0:
    //        combinedTag = filterTag.text + filterOperator;
    //        break;
    //      case filterTags.length - 1:
    //        combinedTag += filterTag.text;
    //        break;
    //      default:
    //        combinedTag += filterTag.text + filterOperator;
    //    }
    //  });
    //  newTags.push({ text: combinedTag });
    //  Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, newTags, function (tagsUpdated) {
    //    /* if persist tag is checked and tags are updated, update dashboard tags*/
    //    if (tagsUpdated && persistTag) {
    //      Dashboards.update(Dashboards.selected).success(function (dashboard) {
    //        vm.dashboard = Dashboards.selected;
    //        /* Get tags used in metrics */
    //        //vm.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
    //        callback(newTags);
    //      });
    //    } else {
    //      callback(newTags);
    //    }
    //  });
    //}

    /* set Tags form graph */
    function setTags() {
      if (vm.showTags) {
        switch (vm.showTags) {
          case true:
            vm.showTags = false;
            break;
          case false:
            vm.showTags = true;
            break;
        }
      } else {
        vm.showTags = true;
      }
    };

    /* update Tags form graph */
    function updateTags(metricToUpdate, tag) {
      vm.showTags = false;
      Metrics.update(metricToUpdate).success(function (metric) {
        Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, metric.tags, function (updated) {
          if (updated) {
            Dashboards.update(Dashboards.selected).success(function (dashboard) {
              vm.dashboard = Dashboards.selected;
              /* Get tags used in metrics */
              vm.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
            });
          }
        });
        $state.go('viewGraphs', {
          'productName': $stateParams.productName,
          'dashboardName': $stateParams.dashboardName,
          'testRunId': $stateParams.testRunId,
          tag: tag //metric.tags[metric.tags.length - 1].text
        });
      });
    };

    function tagRemoved(tag) {
      if (tag.text === $stateParams.tag) {
        Metrics.update(vm.metric).success(function (metric) {

          /* Update tags in Dashboard if any new are added */
          Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, vm.metric.tags, function (tagsUpdated) {

            if (tagsUpdated) {

              Dashboards.update(Dashboards.selected).success(function (dashboard) {
                vm.dashboard = Dashboards.selected;
                /* Get tags used in metrics */
                vm.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
              });
            }
          });
          $state.go($state.current, {}, { reload: true });
        });
      }
    };

    function hasFlash() {
      var hasFlash = false;
      try {
        var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (fo) {
          hasFlash = true;
          return hasFlash;
        }
      } catch (e) {
        if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] != undefined && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
          hasFlash = true;
          return hasFlash;
        }
      }
    };

    /* Zero copied logic */
    function clipClicked() {
      vm.showUrl = false;
    };


  }
}
