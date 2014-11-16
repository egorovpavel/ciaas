'use strict';
var tmp = require('temporary');
// Build handler
// =============
//
// TODO: describe dependencies
//

var Promise = require("bluebird");
var _ = require("lodash");
//var Docker = require("dockerode");
var Docker = Promise.promisifyAll(require('../lib/PromisedDocker'));
var Container = require('../lib/Container');
var JobItem = require("./JobItem.js");

// Handles and configures build execution within docker container.
//
// `Worker` uses Revealing Module Pattern for expose simple public interface.
var Worker = function (options) {
    var options = _.merge({
        postProcess : null
    },options);
    // `dockerode` instance simplifies use of dockers remote API
    var docker = new Docker({
        socketPath: '/var/run/docker.sock'
    });

    // Creates shell script from job order literal
    // Arguments:
    // - `config` __literal__
    //        {
    //            payload : {
    //                commands : <Array of commands>
    //            },
    //            reposity: {
    //                name : <short name of reposity>
    //                uri : <repository uri>
    //            },
    //             skipSetup : <boolean>
    //        }
    var prepareScript = function (config,checkoutpath) {
        var script = [];
        var commands = config.payload.commands;
        for (var idx in commands) {
            script[idx] = "echo '\u001b[32m$ " + commands[idx] + "\u001b[0m'; " + commands[idx] + " || exit 1;";
        }
        var setup = config.skipSetup ? "" : "cd "+checkoutpath+" && git clone "+config.reposity.uri+" -b "+config.reposity.branch+" .;";
        return "(" + setup + script.join('\n') + ")";
    };

    var getSecondaryContainers = function(containersArr){
        return _.map(containersArr,function(item){
            return new Container(docker,{
                container_name :  item.image,
                name : item.name,
                command : item.command,
                stdOut : null
            });
        });
    };

    var getSecondaryLinks = function(containersArr){
        return _.map(containersArr,function(entry){
            return entry.name + ":" + entry.alias;
        });
    };
    var startContainers = function(containers){
        if(containers){
            return _.map(containers,function(container){
                return container.start();
            });
        }else{
            var promise = Promise.pending();
            promise.resolve(true);
            containers = [promise.promise];
        }
        return containers;
    };

    var stopContainers = function(containers){
        if(containers){
            return _.map(containers,function(container){
                return container.stop();
            });
        }else{
            var promise = Promise.pending();
            promise.resolve(true);
            containers = [promise.promise];
        }
        return containers;
    };

    var removeContainers = function(containers){
        if(containers){
            return _.map(containers,function(container){
                return container.remove();
            });
        }else{
            var promise = Promise.pending();
            promise.resolve(true);
            containers = [promise.promise];
        }
        return containers;
    };

    var postProcess = function(data,callback){
        var promise = Promise.pending();
        if(callback){
            callback(data, function(err,data){
                if(err){
                    promise.reject(err);
                }else{
                    promise.resolve(data);
                }
            });
        }else{
            promise.resolve(true);
        }
        promise.promise;
    };

    // Handles execution of build
    // Arguments:
    // - `item` __JobItem__
    var processItem = function (item) {
        var dir = new tmp.Dir();
        var volumes = {};
        var checkoutpath = "/home/"+item.item.reposity.name;
        volumes[checkoutpath] = {};
        var config = item.item;
        var result = {
            artifact : {
                produce : config.artifact_path != '',
                name : [config.reposity.name,config.id].join('_'),
                path : [dir.path,config.artifact_path].join('/')
            }
        };

        var secondaryContainers = getSecondaryContainers(config.container.secondary);
        var secondaryLinks = getSecondaryLinks(config.container.secondary);
        var primaryContainer = new Container(docker,{
            stdOut : item,
            container_name : config.container.primary,
            name : config.container.name + config.id,
            command : ['/bin/bash', '-c', prepareScript(item.item,checkoutpath)],
            timeout : config.config.timeout,
            volumes : volumes,
            links : secondaryLinks,
            binds : dir.path + ":" + checkoutpath
        });

        primaryContainer.onTimeout(function(data){
            Promise.all(removeContainers(secondaryContainers)).then(function(){
                item.emit('timeout',data);
            });
        });

        Promise.all(startContainers(secondaryContainers)).then(function(){
            return primaryContainer.start();
        }).then(function(){
            return primaryContainer.wait();
        }).then(function(data){
            result = _.merge(result,data);
            return Promise.all(stopContainers(secondaryContainers));
        }).then(function(){
            return Promise.all(removeContainers(secondaryContainers));
        }).then(function(){
            return primaryContainer.remove();
        }).then(function(){
            return postProcess(result,options.postProcess);
        }).then(function(){
            item.emit('complete', result);
        }).catch(function(status){
            if(status.statusCode != 404){
                return item.emit('error', status);
            }
            item.emit('complete', result);
        });

        /*

        docker.createContainer({
            Image: item.item.container.primary,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ['/bin/bash', '-c', script],
            OpenStdin: false,
            Volumes : volumes,
            StdinOnce: false
        }, function (err, container) {
            if (err) {
                item.emit('error', err);
            }
            container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
                if (err) {
                    item.emit('error', err);
                }

                stream.setEncoding('utf8');
                stream.pipe(item, {end: true});

                container.start({
                    'Binds': dir.path+":"+checkoutpath
                },function (err, data) {
                    if (err) {
                        return item.emit('error', err);
                    }
                    var timeout_handle = setTimeout(function () {
                        container.stop(function (err, data) {
                            item.emit('timeout', {
                                StatusCode: 100
                            });
                        });
                    }, item.item.config.timeout);
                    container.wait(function (err, data) {
                        if (err) {
                            item.emit('error', err);
                            clearTimeout(timeout_handle);
                        } else {
                            clearTimeout(timeout_handle);
                            var completeBuild = function(err,artifact_name){
                                dir.rmdir();
                                item.emit('complete', data, artifact_name);
                            };
                            if(!item.item.artifact_path){
                                completeBuild();
                            }else{
                                var artifact_name = [item.item.reposity.name,item.item.id].join('_');
                                item.emit('handle_artifact', dir.path+"/"+item.item.artifact_path, artifact_name,completeBuild);
                            }
                        }
                    });

                });
            });
        });*/
    };

    var putItem = function (item, callback) {
        var res = new JobItem(item, callback);
        processItem(res);
        return res;
    };


    // Exposes public interface
    return {
        prepare: prepareScript,
        put: putItem
    }
};

module.exports = Worker;