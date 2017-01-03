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
      url: '/graphs/:productName/:dashboardName/:testRunId/:tag/?zoomFrom&zoomUntil&selectedSeries&metricFilter',
      template: '<graphs-container></graphs-container>'/*,
      resolve: {
        graphType: function(){
          return 'testrun'
        }
      }*/
      //templateUrl: 'modules/graphs/views/trends-content.client.view.html'
    }).state('viewLiveGraphs', {
      url: '/graphs-live/:productName/:dashboardName/:tag/?zoomRange&zoomFrom&zoomUntil&metricFilter',
      template: '<graphs-container></graphs-container>'/*,
      resolve: {
        graphType: function(){
          return 'graphs-live'
        }
      }*/

      //templateUrl: 'modules/graphs/views/graphs-live.client.view.html'
    });
  }
]);
