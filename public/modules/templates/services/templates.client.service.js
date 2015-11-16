'use strict';
//Events service used to communicate Events REST endpoints
angular.module('events').factory('Templates', [
  '$http',

  function ($http) {
    var Templates = {
      list: [],
      selected: {},
      //delete: deleteFn,
      update: update,
      create: create
    };
    return Templates;

    function create(template) {
      return $http.post('/templates', template);
    }

    function update(template) {
      return $http.put('/templates/' + template._id, template);
    }

  }
]);
