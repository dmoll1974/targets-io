'use strict';

//Dashboards service used to communicate Dashboards REST endpoints
angular.module('dashboards').factory('Dashboards', ['$http',
	function($http) {

        var Dashboards = {
//            items : [],
            'get' : getFn,
            selected: '',
            update: update,
            updateTags : updateTags,
            clone : clone,
            create: create,
            delete: deleteFn,
            defaultTag: '',
            getDefaultTag: getDefaultTag

        };

        return Dashboards;


        function updateTags (tags){

            /* if new tags are added, update dashbboard */

            var updatedTags = Dashboards.selected.tags;
            var updated = false;

            _.each(tags, function(tag){

                var tagExists = false;

                _.each(Dashboards.selected.tags, function(existingTag){

                    if (tag.text === existingTag.text) tagExists = true;

                });

                if (tagExists === false){
                    updatedTags.push({text: tag.text});
                    updated = true;
                }

            });

            Dashboards.selected.tags = updatedTags;
            
            return updated;

        }
        
        function clone() {

            return $http.get('/clone/dashboards/' + Dashboards.selected._id).success(function (dashboard) {

                Dashboards.selected = dashboard;
                Dashboards.defaultTag = getDefault(Dashboards.selected.tags)
            });
        }
            
        function update(){
            return $http.put('/dashboards/' + Dashboards.selected._id, Dashboards.selected);
        }

        function create(dashboard, productName){
            return $http.post('/dashboards/' + productName, dashboard);
        }

        function getFn(productName, dashboardName){
            return $http.get('/dashboards/' + productName + '/' + dashboardName).success(function(dashboard){

                Dashboards.selected = dashboard;
                Dashboards.defaultTag = getDefaultTag(Dashboards.selected.tags)
            });
        }

        function deleteFn(dashboardId){
            return $http.delete('/dashboards/' + dashboardId);
        }


        function getDefaultTag(tags){

            var defaultTag = 'All';

            _.each(tags, function(tag){

                if(tag.default === true){
                    defaultTag = tag;
                    return;
                }
            })

            return defaultTag.text;
        }

    }
]).factory('DashboardTabs', ['$http',
    function($http) {

        var DashboardTabs = {
            setTab : setTab,
            tabNumber : 1,
            isSet : isSet 
        };

        return DashboardTabs;

        function isSet(tabNumber){
            
            return DashboardTabs.tabNumber === tabNumber;
            
        }

        function setTab(tabName){

            switch(tabName){

                case 'Test runs':
                    DashboardTabs.tabNumber = 1;
                    break;
                case 'Metrics':
                    DashboardTabs.tabNumber = 2;
                    break;
                case 'Events':
                    DashboardTabs.tabNumber = 3;
                    break;
                case 'Tags':
                    DashboardTabs.tabNumber = 4;
                    break;
                default:
                    DashboardTabs.tabNumber = 1;
                    break;
            }

        }

    }
]);
