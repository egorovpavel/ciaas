'use strict';
var tmp = require('temporary');
// Build handler
// =============
//
// TODO: describe dependencies
//

var Docker = require("dockerode");
var Container = require("./item_container.js");

// Handles and configures build execution within docker container.
//
// `Worker` uses Revealing Module Pattern for expose simple public interface.
var Worker = function () {

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


    // Handles execution of build
    // Arguments:
    // - `item` __Container__
    var processItem = function (item) {
        var dir = new tmp.Dir();
        var volumes = {};
        var checkoutpath = "/home/"+item.item.reposity.name;
        volumes[checkoutpath] = {};
        console.log("VOLUMES:",volumes);
        var script = prepareScript(item.item,checkoutpath);

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
        });

    };

    var putItem = function (item, callback) {
        var res = new Container(item, callback);
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