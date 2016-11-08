'use strict';
//Events service used to communicate Events REST endpoints
angular.module('events').factory('Templates', [
  '$http', 'Utils',

  function ($http, Utils) {
    var Templates = {
      list: [],
      runningTest: '',
      numberOfRunningTest: '',
      replaceItems: [],
      selected: {},
      selectedIndex: 0,
      metric: {},
      variable: {},
      metricClone: {},
      templateClone: {},
      mergeData: [],
      getAll: getAll,
      get: getFn,
      //delete: deleteFn,
      update: update,
      create: create,
      delete: deleteFn

    };
    return Templates;

    function deleteFn(templateId){

      return $http.delete('/templates/' + templateId)
    }
    function getFn(templateName) {

      return $http.get('/template-by-name/' + templateName);


    }

    function create(template) {
      /* sort tags */
      _.each(template.metrics, function(metric){
        metric.tags = metric.tags.sort(Utils.dynamicSort('text'));
      })


      return $http.post('/templates', template);
    }

    function update(template) {
      /* sort tags */
      _.each(template.metrics, function(metric){
        metric.tags = metric.tags.sort(Utils.dynamicSort('text'));
      })

      return $http.put('/templates/' + template._id, template);
    }

    function getAll(){

      return $http.get('/templates');
    }
  }
]);
