'use strict';
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
    var prepareScript = function (config) {
        var script = [];
        var commands = config.payload.commands;
        for (var idx in commands) {
            script[idx] = "echo '$ " + commands[idx] + "'; " + commands[idx] + " || exit 1;";
        }
        var setup = config.skipSetup ? "" : "git clone "+config.reposity.uri+" && cd "+config.reposity.name+";";
        return "(" + setup + script.join('\n') + ")";
    };


    // Handles execution of build
    // Arguments:
    // - `item` __Container__
    var processItem = function (item) {

        var script = prepareScript(item.item);

        docker.createContainer({
            Image: item.item.container.primary,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ['/bin/sh', '-c', script],
            OpenStdin: false,
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


                container.start(function (err, data) {
                    if (err) {
                        item.emit('error', err);
                    }

                    container.wait(function (err, data) {
                        if (err) {
                            item.emit('error', err);
                        } else {
                            item.emit('complete', data);
                        }
                    });
                    setTimeout(function () {
                        container.stop(function (err, data) {
                            item.emit('timeout', {
                                StatusCode: 100
                            });
                        });
                    }, item.item.config.timeout);
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