"use strict";
require('should');
var stream = require("stream");
var Writable = stream.Writable;
var util = require("util");

var Promise = require("bluebird");
var Docker = Promise.promisifyAll(require('../lib/PromisedDocker'));
var Container = require('../lib/Container');
var TestStreamWriter = function (options) {
    this.data = "";
    options = !options ? {} : options;
    options.objectMode = true;
    Writable.call(this, options);
};

util.inherits(TestStreamWriter, Writable);
TestStreamWriter.prototype._write = function (chunk, enc, cb) {
    this.data += chunk.toString();
    cb();
};
TestStreamWriter.prototype.getData = function () {
    return this.data;
};
describe('Container', function() {
    describe('Should create create and start container', function () {
        it('it creates container using options', function (done, fail) {
            this.timeout(5000);

            var docker = new Docker({
                socketPath: '/var/run/docker.sock'
            });

            var container = new Container(docker, {
                stdOut :null,
                container_name : "ciaas-nodejs",
                name : "nodejsSimple",
                command : ["node","-v"]
            });

            container.start().then(function(){
                return container.wait();
            }).then(function(){
                return container.remove();
            }).then(function(){
                done();
            }).catch(fail);
        });
        it('it creates two dependent containers and waits for primary to complete', function (done, fail) {
            this.timeout(15000);

            var docker = new Docker({
                socketPath: '/var/run/docker.sock'
            });

            var containerDepOne = new Container(docker, {
                stdOut :null,
                container_name : "redis",
                name : "redisOne",
                command : ["redis-server"]
            });
            var containerDepTwo = new Container(docker, {
                stdOut :null,
                container_name : "redis",
                name : "redisTwo",
                command : ["redis-server"]
            });

            var primaryContainer = new Container(docker, {
                stdOut :null,
                container_name : "ciaas-nodejs",
                name : "nodejsTwo",
                command : ["sleep","1"]
            });

            Promise.all([containerDepOne.start(),containerDepTwo.start()]).then(function(){
                return primaryContainer.start();
            }).then(function(){
                return primaryContainer.wait();
            }).then(function(){
                return Promise.all([containerDepOne.stop(),containerDepTwo.stop()]);
            }).then(function(){
                return Promise.all([containerDepOne.remove(),containerDepTwo.remove()]);
            }).then(function(){
                return primaryContainer.remove();
            }).then(function(){
                done();
            }).catch(fail);

        });

        it('it creates dependent containers and links it to primary', function (done, fail) {
            this.timeout(9115000);

            var writer = new TestStreamWriter();

            var docker = new Docker({
                socketPath: '/var/run/docker.sock'
            });

            var containerDepTwo = new Container(docker, {
                stdOut :null,
                container_name : "redis",
                name : "redis",
                command : ["redis-server"]
            });

            var primaryContainer = new Container(docker, {
                stdOut : writer,
                container_name : "ciaas-nodejs",
                name : "nodejsLink",
                command : ["/bin/sh","-c","(redis-cli -h redis_alias ping)"],
                links : ["redis:redis_alias"]
            });

            Promise.all([containerDepTwo.start()]).then(function(){
                return primaryContainer.start();
            }).then(function(){
                return primaryContainer.wait();
            }).then(function(){
                return Promise.all([containerDepTwo.stop()]);
            }).then(function(){
                return Promise.all([containerDepTwo.remove()]);
            }).then(function(){
                return primaryContainer.remove();
            }).then(function(){
                writer.getData().slice(-6).should.be.equal("PONG\r\n");
                done();
            }).catch(fail);

        });

        it('it creates dependent containers and links it to primary and handles timeout correctly', function (done, fail) {
            this.timeout(9115000);

            var writer = new TestStreamWriter();

            var docker = new Docker({
                socketPath: '/var/run/docker.sock'
            });

            var containerDepTwo = new Container(docker, {
                stdOut :null,
                container_name : "redis",
                name : "redis",
                command : ["redis-server"]
            });

            var primaryContainer = new Container(docker, {
                stdOut : writer,
                container_name : "ciaas-nodejs",
                name : "nodejsLink",
                command : ["sleep","5"],
                links : ["redis:redis_alias"],
                timeout : 2000
            });

            primaryContainer.onTimeout(function(result){
                Promise.all([containerDepTwo.stop()]).then(function(){
                    return Promise.all([containerDepTwo.remove()]);
                }).then(function(){
                    done();
                })
            });

            Promise.all([containerDepTwo.start()]).then(function(){
                return primaryContainer.start();
            }).then(function(){
                return primaryContainer.wait();
            }).catch(fail);

        });

        it('it creates dependent containers and links it to primary and handles complete correctly', function (done, fail) {
            this.timeout(9115000);

            var writer = new TestStreamWriter();

            var docker = new Docker({
                socketPath: '/var/run/docker.sock'
            });

            var containerDepTwo = new Container(docker, {
                stdOut :null,
                container_name : "redis",
                name : "redis",
                command : ["redis-server"]
            });

            var primaryContainer = new Container(docker, {
                stdOut : writer,
                container_name : "ciaas-nodejs",
                name : "nodejsLink",
                command : ["sleep","5"],
                links : ["redis:redis_alias"]
            });

            Promise.all([containerDepTwo.start()]).then(function(){
                return primaryContainer.start();
            }).then(function(){
                return primaryContainer.wait();
            }).then(function(data){
                return Promise.all([containerDepTwo.stop()]);
            }).then(function(){
                return Promise.all([containerDepTwo.remove()]);
            }).then(function(){
                return primaryContainer.remove();
            }).then(function(){
                done();
            }).catch(fail);

        });
    });
});