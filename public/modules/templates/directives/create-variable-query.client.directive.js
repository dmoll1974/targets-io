'use strict';

angular.module('templates').directive('createVariableQuery', CreateVariableQueryDirective);

function CreateVariableQueryDirective () {

    var directive = {
        scope: {
            target: '=',
            index: '='
        },
        restrict: 'EA',
        templateUrl: 'modules/templates/directives/create-variable-query.client.view.html',
        controller: CreateVariableQueryDirectiveController,
        controllerAs: 'ctrlCreateGraphiteQuery'
    };

    return directive;

    /* @ngInject */
    function CreateVariableQueryDirectiveController ($scope, $state, $timeout, Graphite, $mdMenu) {

        console.log('target: ' + $scope.target);

        /* get initial values for graphite target picker*/
        Graphite.findMetrics('*').success(function(graphiteTargetsLeafs) {

            var graphiteTargets = [];

            _.each(graphiteTargetsLeafs, function (graphiteTargetsLeaf) {
                graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
            });

            $scope.defaultGraphiteTargets = graphiteTargets;
            $scope.graphiteTargets = $scope.defaultGraphiteTargets;
            $scope.expandable = true;

        });

        /* Open menu*/

        $scope.openMenu = function($mdOpenMenu, $event, target) {


            /* remove trailing dot */
            if(target.lastIndexOf('.') === (target.length - 1)){
                target = target.substring(0, target.length - 1);
            }

            /* Check if current target returns any 'leafs'*/

            Graphite.findMetrics(target + '.*').success(function(graphiteTargetsLeafs) {

                /* if leafs are present, add wildcard '*' */
                if (graphiteTargetsLeafs.length > 0) {
                    var graphiteTargets = [];
                    graphiteTargets.push({text: '*', id: '*'});

                    _.each(graphiteTargetsLeafs, function (graphiteTargetsLeaf) {
                        graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
                    });

                    $scope.graphiteTargets = graphiteTargets;

                    /* if no leafs, show root query results*/
                } else {

                    $scope.graphiteTargets = $scope.defaultGraphiteTargets;

                }

                var menu = $mdOpenMenu($event);

                /* hacks to prevent md-menyu from closing when navigating Graphite tree */
                $timeout(function() {
                    var menuContentId = 'targets-menu-content-' + $scope.index;
                    var menuContent =  document.getElementById(menuContentId);

                    function hasAnyAttribute(target, attrs) {
                        if (!target) return false;
                        for (var i = 0, attr; attr = attrs[i]; ++i) {
                            var altForms = [attr, "data-" + attr, "x-" + attr];
                            for (var j = 0, rawAttr; rawAttr = altForms[j]; ++j) {
                                if (target.hasAttribute(rawAttr)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    };

                    function getClosest(el, tagName, onlyParent) {
                        if (el instanceof angular.element) el = el[0];
                        tagName = tagName.toUpperCase();
                        if (onlyParent) el = el.parentNode;
                        if (!el) return null;
                        do {
                            if (el.nodeName === tagName) {
                                return el;
                            }
                        } while (el = el.parentNode);
                        return null;
                    };
                    menuContent.parentElement.addEventListener('click', function(e) {
                        console.log('clicked');
                        var target = e.target;
                        do {
                            if (target === menuContent) return;
                            if (hasAnyAttribute(target, ["ng-click", "ng-href", "ui-sref"]) || target.nodeName == "BUTTON" || target.nodeName == "MD-BUTTON") {
                                var closestMenu = getClosest(target, "MD-MENU");
                                if (!target.hasAttribute("disabled") && (!closestMenu || closestMenu == opts.parent[0])) {
                                    if (target.hasAttribute("md-menu-disable-close") &&  $scope.expandable) {
                                        event.stopPropagation();
                                        angular.element(target).triggerHandler('click');
                                    }else{

                                        $mdMenu.hide(menu, { closeAll: true });
                                    }

                                    return; //let it propagate
                                }
                                break;
                            }
                        } while (target = target.parentNode);
                    }, true);
                });
            });
        };

        /* get targets from Graphite */

        $scope.getTargets = function(target, graphiteTargetId, targetIndex){

            var query;

            if(graphiteTargetId === '*'){

                query = target + '.' + graphiteTargetId;// + '.*';

            }else{

                query = graphiteTargetId + '.*';
            }

            Graphite.findMetrics(query).success(function(graphiteTargetsLeafs){

                var graphiteTargets = [];
                if(graphiteTargetsLeafs.length > 0) {

                    $scope.expandable = isExpandable(graphiteTargetsLeafs);

                    graphiteTargets.push({text: '*', id: '*'});
                    _.each(graphiteTargetsLeafs, function (graphiteTargetsLeaf) {
                        graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
                    });
                }

                $scope.graphiteTargets = graphiteTargets;

                if(graphiteTargetId === '*'){

                    $timeout(function(){
                        $scope.target = $scope.expandable ? target + '.' + graphiteTargetId + '.*' : target + '.' + graphiteTargetId;
                    }, 0);

                }else{
                    $timeout(function(){
                        $scope.target = $scope.expandable ? graphiteTargetId + '.*' : graphiteTargetId ;
                    }, 0);

                }



            });
        };

        function isExpandable(graphiteTargets){

            var isExpandable = false;
            _.each(graphiteTargets, function(target){
                if(target.expandable === 1)isExpandable = true;
            })
            return isExpandable;
        }




    }
}
