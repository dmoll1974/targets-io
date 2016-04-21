'use strict';
//Dashboards service used to communicate Dashboards REST endpoints
angular.module('dashboards').factory('Dashboards', [
  '$http', 'Utils',
 function ($http, Utils) {

    var Dashboards = {
    //            items : [],
    'get': getFn,
    selected: {},
    update: update,
    updateTags: updateTags,
    clone: clone,
    create: create,
    delete: deleteFn,
    defaultTag: '',
    getDefaultTag: getDefaultTag,
    selectedTab: 0,
    getDashboardsForProduct: getDashboardsForProduct

  };
  return Dashboards;


  function updateTags(productName, dashboardName, tags, callback) {
    /* if new tags are added, update dashbboard */
    getFn(productName, dashboardName).success(function (dashboard) {


      Dashboards.selected = dashboard;
      var updatedTags = Dashboards.selected.tags;
      var updated = false;

      _.each(tags, function (tag) {

        var tagExists = false;

        _.each(Dashboards.selected.tags, function (existingTag) {

          if (tag.text === existingTag.text)
            tagExists = true;
        });

        if (tagExists === false) {
          updatedTags.push({ text: tag.text, default: false });
          updated = true;
        }
      });

      Dashboards.selected.tags = updatedTags;
      callback(updated);
    });
  }
  function clone() {
    return $http.get('/clone/dashboards/' + Dashboards.selected._id).success(function (dashboard) {
      Dashboards.selected = dashboard;
      Dashboards.defaultTag = getDefaultTag(Dashboards.selected.tags);
    });
  }
  function create(dashboard, productName) {
    return $http.post('/dashboards/' + productName, dashboard);
  }
  function getFn(productName, dashboardName) {
    return $http.get('/dashboards/' + productName + '/' + dashboardName).success(function (dashboard) {

      /* sort dashboard metrics by tag[0]*/
      dashboard.metrics = dashboard.metrics.sort(Utils.dynamicSortTags(''));

      Dashboards.selected = dashboard;
      Dashboards.selected.productName = productName;
      Dashboards.defaultTag = getDefaultTag(Dashboards.selected.tags);
    });
  }
  function deleteFn(dashboardId) {
    return $http.delete('/dashboards/' + dashboardId);


  }

   function update(dashboard) {
     return $http.put('/dashboards/' + dashboard._id, dashboard);
   }

  function getDefaultTag(tags) {
    var defaultTag = 'All';
    _.each(tags, function (tag) {
      if (tag.default === true) {
        defaultTag = tag;
        return;
      }
    });
    return defaultTag.text;
  }

  function getDashboardsForProduct(productName) {
    return $http.get('/get-dashboards-for-product/' + productName);
  }
}
]);
