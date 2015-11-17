'use strict';
//Events service used to communicate Events REST endpoints
angular.module('events').factory('Templates', [
  '$http',

  function ($http) {
    var Templates = {
      list: [],
      selected: {},
      metric: {},
      variable: {},
      getAll: getAll,
      get: getFn,
      //delete: deleteFn,
      update: update,
      create: create
    };
    return Templates;

    function getFn(templateName) {
      return $http.get('/template-by-name/' + templateName);
    }

    function create(template) {
      return $http.post('/templates', template);
    }

    function update(template) {
      return $http.put('/templates/' + template._id, template);
    }

    function getAll(){

      return $http.get('/templates');
    }
  }
]);
