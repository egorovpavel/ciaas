'use strict';

angular.module('CI', [
    'ngRoute',
    'CI.filters',
    'CI.services',
    'CI.directives',
    'CI.controllers',
    'btford.socket-io'
]).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/config', {templateUrl: '/app/partials/index.html', controller: 'ConfigController'});
    $routeProvider.when('/build/:buildid', {templateUrl: '/app/partials/build.html', controller: 'BuildResultController'});
    $routeProvider.otherwise({redirectTo: '/config'});
}]);