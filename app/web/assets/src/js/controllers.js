'use strict';

/* Controllers */

angular.module('CI.controllers', [])
    .controller('ProjectConfigController', ['$scope', function ($scope) {
        console.log("CONTROLLER");
        $scope.select = function(){
            console.log("SELECT");
        }
    }])
    .controller('BuildResultController', ['$scope', '$routeParams', 'iosocket', '$sce', function ($scope, $routeParams, iosocket, $sce) {

        $scope.buildId = $routeParams.buildid;
        $scope.complete = false;
        $scope.lines = [];
        iosocket.emit("build.feed", {
            id: $scope.buildId,
            repo_uri: $scope.repo_uri
        });
        iosocket.on('channel_result_' + $scope.buildId, function (data) {
            $scope.complete = data.status;
        });
        iosocket.on('channel_' + $scope.buildId, function (data) {
            var entry = data;
            if (/\r/.test(entry.data) && /\r/.test($scope.lines[$scope.lines.length - 1].data)) {
                console.log("pop");
                $scope.lines.pop();
            }
            $scope.lines[entry.line] = entry;
        });
    }])
    .controller('RTBuildResultController', ['$scope', 'iosocket', '$sce', function ($scope, iosocket, $sce) {
        $scope.init = function (id, _id) {
            $scope._id = _id;
            $scope.buildId = id;
            $scope.complete = false;
            $scope.lines = [];
            iosocket.emit("rt.build.feed", {
                id: $scope.buildId,
                _id: $scope._id,
                repo_uri: $scope.repo_uri
            });
            iosocket.on('channel_result_' + $scope._id, function (data) {
                $scope.complete = data.status;
                window.location.reload();
            });
            iosocket.on('channel_' + _id, function (data) {
                var entry = data;
                if (/\r/.test(entry.data) && /\r/.test($scope.lines[$scope.lines.length - 1].data)) {
                    console.log("pop");
                    $scope.lines.pop();
                }
                $scope.lines[entry.line] = entry;
            });
            console.log("BUILDID:", _id);
        };
    }]);