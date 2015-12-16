'use strict';
//Setting up route
angular.module('graphs').config([
  'ngClipProvider',
  function (ngClipProvider) {
    ngClipProvider.setPath('lib/zeroclipboard/dist/ZeroClipboard.swf');
  }
]).config([
  '$stateProvider',
  function ($stateProvider) {
    // Graphs state routing
    $stateProvider.state('viewGraphs', {
      url: '/graphs/:productName/:dashboardName/:testRunId/:tag?zoomFrom&zoomUntil&selectedSeries&metricFilter',
      templateUrl: 'modules/graphs/views/graphs.client.view.html'
    })/*.state('deepLinkGraph', {
      url: '/graphs/:productName/:dashboardName/:testRunId/:tag?zoomFrom&zoomUntil&selectedSeries&metricFilter',
      templateUrl: 'modules/graphs/views/graphs.client.view.html'
    })*/.state('viewLiveGraphs', {
      url: '/graphs-live/:productName/:dashboardName/:tag?zoomFrom&zoomUntil&metricFilter',
      templateUrl: 'modules/graphs/views/graphs-live.client.view.html'
    })/*.state('deepLinkLiveGraph', {
      url: '/graphs-live/:productName/:dashboardName/:tag?zoomFrom&zoomUntil&metricFilter',
      templateUrl: 'modules/graphs/views/graphs-live.client.view.html'
    })*/;
  }
]);
