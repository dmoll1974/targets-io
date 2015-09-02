'use strict';

angular.module('graphs').factory('Tags', ['Utils', 'TestRuns',
	function(Utils, TestRuns) {

        var Tags = {
            setTags: setTags//,
            //createHighstockSeries: createHighstockSeries

        };

        return Tags;

        function setTags (metrics, productName, dashBoardName, testRunId, dashboardTags){

            var tags = [];

            
            tags.push({text: 'All', route: {productName: productName, dashboardName: dashBoardName, tag: 'All'}});

            _.each(metrics, function(metric){

                _.each(metric.tags, function(tag){

                    if(tagExists(tags, tag)) tags.push({text: tag.text, route: {productName: productName, dashboardName: dashBoardName, tag: tag.text, testRunId: testRunId}});

                })

            });

            /* add filter tags */
            _.each(dashboardTags, function(dashboardTag){

                if(dashboardTag.text.indexOf(" AND ") > -1 || dashboardTag.text.indexOf(" OR ") > -1 ) {

                    tags.push({text: dashboardTag.text,
                        route: {
                            productName: productName,
                            dashboardName: dashBoardName,
                            tag: dashboardTag.text,
                            testRunId: testRunId
                        }
                    });
                }
            });


            tags.sort(Utils.dynamicSort('text'));
            
            //if available, add Gatling-details tab
            if(TestRuns.selected && TestRuns.selected.buildResultKey){
                tags.unshift({text: 'Gatling', route: {productName: productName, dashboardName: dashBoardName, tag: 'Gatling'}});

            }
            
           

            return tags;
        }

        function tagExists(existingTags, newTag){

            var isNew = true;

            _.each(existingTags, function(existingTag){

                if(existingTag.text === newTag.text) isNew = false;
            })

            return isNew;
        }
	}
]);
