(function () {
  'use strict';
  /* public/modules/graphs/directives/gatling-details.client.directive.js */
  /**
     * @desc
     * @example <div gatling-details></div>
     */
  angular.module('graphs').directive('gatlingDetails', GatlingDetailsDirective).directive('loadingContainer', LoadingContainerDirective);
  function GatlingDetailsDirective() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/graphs/directives/gatling-details.client.view.html',
      controller: GatlingDetailsController,
      controllerAs: 'vm'
    };
    return directive;
    /* @ngInject */
    function GatlingDetailsController($scope, $timeout, $filter, $stateParams, Jenkins, TestRuns, ngTableParams, $window, Utils, Dashboards, Products) {

      $scope.setTab = setTab;
      $scope.isSet = isSet;
      $scope.deepLinkToGraylog = deepLinkToGraylog;


      /* activate */

      activate();


      /* functions */

      function setTab(newValue) {
        $scope.tabNumber = newValue;
        $scope.tableParams.filter({});
        $scope.tableParams.reload();
      };

      function isSet(tabNumber) {
        return $scope.tabNumber === tabNumber;
      };

      function deepLinkToGraylog(error){

          var query = Dashboards.selected.jenkinsJobName ? '&q=%28gatling_error%3A%22' + encodeURI(error) + '%22+AND+jenkins_job%3A' + encodeURI(Dashboards.selected.jenkinsJobName) + '%29+OR+%28facility%3A' + encodeURI($scope.graylogFacility) + '+AND+NOT+level%3A6%29' : '&q=%28gatling_error%3A%22' + encodeURI(error) + '%22' + '%29+OR+%28facility%3A' + encodeURI($scope.graylogFacility) + '+AND+NOT+level%3A6%29';

          var url = $scope.graylogUrl + '/search?rangetype=absolute&fields=message%2Csource&width=1680&from=' + encodeURI(new Date(TestRuns.selected.start).toISOString())  + '&to=' + encodeURI(new Date(TestRuns.selected.end).toISOString()) + query;

        $window.open(url, '_blank');
      }

      function activate() {

        $scope.graylogFacility =  (Products.selected.graylogFacility) ? Products.selected.graylogFacility : 'PRODUCT_FACILTY_NAME';

        $scope.tabNumber = 0;

        Utils.getGraylogGuiUrl().success(function (graylog){

          $scope.graylogUrl = graylog ? graylog.guiUrl : undefined;

        });

        TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
          TestRuns.selected = testRun;
          $scope.buildResultsUrl = TestRuns.selected.buildResultsUrl;
          $scope.tableParams = new ngTableParams({
            page: 1,
            // show first page
            count: 50,
            // count per page
            sorting: {
              KO: 'desc',
              // initial sorting
              OK: 'desc',
              numberOfErrors: 'desc'
            }
          }, {
            total: 0,
            // length of data
            getData: function ($defer, params) {
              // ajax request to api
              Jenkins.getData(TestRuns.selected.buildResultsUrl, false, $stateParams.productName, $stateParams.dashboardName).success(function (response) {
                $timeout(function () {
                  var data = $scope.tabNumber === 0 ? response.data : response.errors;
                  var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
                  var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                  // update table params
                  params.total(orderedData.length);
                  // set new data
                  $defer.resolve(orderedData);
                }, 500);
              }).error(function (data, status, header, config) {
                // no console data available
                $scope.noDataAvailable = true;
              });
              ;
            }
          });
        });
      }
    }
  }
  function LoadingContainerDirective() {
    var directive = {
      restrict: 'A',
      scope: false,
      link: function (scope, element, attrs) {
        var loadingLayer = angular.element('<div class="loading"></div>');
        element.append(loadingLayer);
        element.addClass('loading-container');
        scope.$watch(attrs.loadingContainer, function (value) {
          loadingLayer.toggleClass('ng-hide', !value);
        });
      }
    };
    return directive;
  }
}());
