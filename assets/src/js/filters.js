'use strict';

/* Filters */

angular.module('CI.filters', []).filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    }]).filter('to_trusted', ['$sce', function($sce){
        return function(text) {
        	console.log("TRUSTED",text);
            return $sce.trustAsHtml(text);
        };
    }]).filter('joinBy', function () {
        return function (input,delimiter) {
            return (input || []).join(delimiter || ',');
        };
    });