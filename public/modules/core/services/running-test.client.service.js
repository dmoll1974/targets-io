'use strict';
//Dashboards service used to communicate Dashboards REST endpoints
angular.module('core').factory('RunningTests', [
  '$http', 'Utils',
  function ($http, Utils) {
    var RunningTests = {
      //            items : [],
      'get': getFn

    };
    return RunningTests;

    function getFn() {

      return $http.get('/get-running-tests');

    }

  }
]);
