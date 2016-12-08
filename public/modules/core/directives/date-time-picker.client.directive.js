'use strict';

angular.module('core').directive('dateTimePicker', DateTimePickerDirective)
function DateTimePickerDirective () {

    var directive = {
        scope: {
            timestamp: '=',
        },
        restrict: 'EA',
        templateUrl: 'modules/core/directives/date-time-picker.client.view.html',
        controller: DateTimePickerDirectiveController
    };

    return directive;

    /* @ngInject */
    function DateTimePickerDirectiveController ($scope, $mdDialog, $filter, Events) {


        $scope.openCalendarDialog = openCalendarDialog;


        //$scope.saveTimestamp = saveTimestamp;
        //$scope.cancelTimestamp = cancelTimestamp;
        //

        //$scope.$watch('timestamp', function (newVal, oldVal) {
        //    if(newVal !== oldVal)$scope.scDateTimestamp = $filter('date')(newVal, 'yyyy-MM-ddTHH:mm:ss.sssZ').toString();;
        //}, true);
        //
        //activate();
        //
        //function activate(){
        //
        //    $scope.openCalendar = false;
        //
        //}
        //
        //
        //function saveTimestamp (timestamp){
        //
        //    $scope.timestamp = timestamp;
        //    $scope.openCalendar = false;
        //}
        //
        //function cancelTimestamp(){
        //
        //    $scope.openCalendar = false;
        //
        //}


        function openCalendarDialog($event){

            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'modules/core/views/date-time-picker.dialog.client.view.html',
                //locals: {
                //    dialogTimestamp: $scope.timestamp
                //},
                scope: $scope,
                preserveScope : true,

                controller: DialogController
            });
            function DialogController($scope, $mdDialog, $timeout) {

                //$scope.timestamp = event.eventTimestamp;
                $scope.dialogTimestamp = $scope.timestamp;
                $scope.saveTimestamp = saveTimestamp;
                $scope.cancelTimestamp = cancelTimestamp;

                function saveTimestamp (timestamp){

                    //$timeout(function(){

                        $scope.timestamp = timestamp;
                        $mdDialog.hide();

                    //})

                }

                function cancelTimestamp(){

                    $mdDialog.hide();
                }

            }
        }

    }
}
