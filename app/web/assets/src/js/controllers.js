'use strict';

/* Controllers */

angular.module('CI.controllers', [])
    .controller('ConfigController', ['$scope', '$http', '$location', function ($scope, $http, $location) {
        $scope.item = {
            config: {
                language: "nodejs",
                timeout: 99999999
            },
            reposity: {
                uri: "https://github.com/mishoo/UglifyJS2.git",
                name: "UglifyJS2"
            },
            payload: {
                commands: "npm update\nnpm test"
            }
        };
        $scope.buildId = undefined;
        $scope.build = function (item) {
            item.payload.commands = item.payload.commands.split("\n");
            $http.post('/dashboard', {item: item}).success(function (data, status, headers, config) {
                $location.path('/build/' + data.id);
            }).error(function (data, status, headers, config) {
                $scope.error = data;
            });
        };
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