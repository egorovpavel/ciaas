'use strict';
var Promise = require("bluebird");
var Docker = require("dockerode");

var PromisedContainer = function(container){
    var start = function(options){
        var promise = Promise.pending();
        container.start(options, function(err, container){
            if(err){
                promise.reject(err);
            }else{
                promise.resolve(container);
            }
        });
        return promise.promise;
    };

    var attach = function(options){
        var promise = Promise.pending();
        container.attach(options, function(err, container){
            if(err){
                promise.reject(err);
            }else{
                promise.resolve(container);
            }
        });
        return promise.promise;
    };

    var wait = function(){
        var promise = Promise.pending();
        container.wait(function(err, data){
            if(err){
                promise.reject(err);
            }else{
                promise.resolve(data);
            }
        });
        return promise.promise;
    };

    var stop = function(options){
        var promise = Promise.pending();
        container.stop(options, function(err, container){
            if(err){
                promise.reject(err);
            }else{
                promise.resolve(container);
            }
        });
        return promise.promise;
    };

    var remove = function(options){
        var promise = Promise.pending();
        container.remove(options, function(err, container){
            if(err){
                promise.reject(err);
            }else{
                promise.resolve(container);
            }
        });
        return promise.promise;
    };

    var dummy = function(){
        var promise = Promise.pending();
        promise.resolve.apply(promise,arguments);
        return promise.promise;
    };

    return {
        start : start,
        attach : attach,
        wait : wait,
        stop : stop,
        remove : remove,
        dummy : dummy
    }
};


var PromisedDocker = function(options){
    var docker = new Docker(options);

    var create = function(options){
        var promise = Promise.pending();
        docker.createContainer(options, function(err, container){
            if(err){
                promise.reject(err);
            }else{
                promise.resolve(new PromisedContainer(container));
            }
        });
        return promise.promise;
    };

    return {
        create : create
    };
};

module.exports = PromisedDocker;