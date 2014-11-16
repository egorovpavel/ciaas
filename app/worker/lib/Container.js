'use strict';
var _ = require("lodash");
var tmp = require('temporary');
var utils = require('util');
var EventEmitter = require('events').EventEmitter;

var Container = function(docker,options, buildOptions){
    var options = _.merge({
        command : ['date'],
        stdOut : process.stdout
    },options);
    var self = this;

    var container_inst;
    var timeout_handle;

    var timeout = function(timeout){
        timeout_handle =  setTimeout(function () {
            container_inst.remove({v:true,force:true}).then(function(){
                timeout_handle && clearTimeout(timeout_handle);
                self.emit("timeout",{
                    StatusCode : 100
                });
            }).catch(function(err){
                self.emit("error",err);
            });
        }, timeout);
        return timeout_handle;
    };

    var start = function(){
        return docker.create({
            Image: options.container_name,
            Cmd: options.command,
            name : options.name,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            OpenStdin: true,
            StdinOnce: false
        }).then(function(container){
            container_inst = container;
            return container.attach({
                stream: true,
                stdout: true,
                stderr: true
            });
        }).then(function(stream){
            stream.setEncoding('utf8');
            options.stdOut && stream.pipe(options.stdOut, {end: true});
            return container_inst.start({Links:options.links, Binds : options.binds});
        });
    };

    var wait = function(){
        options.timeout && timeout(options.timeout);
        return container_inst.wait().then(function(data){
            timeout_handle && clearTimeout(timeout_handle);
            return container_inst.dummy(data);
        });
    };

    var stop = function(){
        timeout_handle && clearTimeout(timeout_handle);
        return container_inst.stop({t:0});
    };

    var remove = function(){
        timeout_handle && clearTimeout(timeout_handle);
        return container_inst.remove({v:true,force:true});
    };

    return {
        start : start,
        stop : stop,
        wait : wait,
        remove : remove,
        onTimeout : function(callback){
            self.on('timeout',callback);
        }
    };
};

utils.inherits(Container,EventEmitter);

module.exports = Container;