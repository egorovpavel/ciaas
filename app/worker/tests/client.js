'use strict';
require('should');
var Client = require('../lib/Client.js');
var Queue = require('bull');
var logger = require('../lib/Logger.js')();

describe('Client', function () {
    describe('Queue', function () {
        it('Should process job once it added to build queue', function (done, fail) {
            this.timeout(5000);
            var item = {
                config: {
                    language: "JS",
                    timeout: 5000
                },
                container : {
                    primary : "ciaas-nodejs"
                },
                skipSetup : true,
                reposity : {
                    uri : "https://github.com/jashkenas/underscore.git",
                    name: "underscore",
                    branch : "master"
                },
                payload: {
                    commands: [
                        "echo 'Hello world'"
                    ]
                }
            };

            var queue = Queue('build', 6379, '127.0.0.1');
            var client = new Client('127.0.0.1', 6379, logger);
            client.complete(function () {
                client.close();
                queue.close();
                done();
            });

            queue.empty().then(function () {
                return queue.add(item);
            });

        });
        it('Should report progress', function (done, fail) {
            this.timeout(5000);
            var item = {
                config: {
                    language: "JS",
                    timeout: 5000
                },
                container : {
                    primary : "ciaas-nodejs"
                },
                skipSetup : true,
                reposity : {
                    uri : "https://github.com/jashkenas/underscore.git",
                    name: "underscore",
                    branch : "master"
                },
                payload: {
                    commands: [
                        "echo 'Hello world'"
                    ]
                }
            };
            var result = "";
            var expected = "\u001b[32m$ echo Hello world\u001b[0mHello world";
            var client = new Client('127.0.0.1', 6379, logger);
            var queue = Queue('build', 6379, '127.0.0.1');
            client.progress(function (data) {
                result += data.data;
            });
            client.complete(function () {
                result.should.be.equal(expected);
                client.close();
                queue.close();
                done();
            });
            queue.empty().then(function () {
                return queue.add(item);
            });

        });
        it('Should put result result into result queue', function (done, fail) {
            this.timeout(50000);
            var item = {
                config: {
                    language: "JS",
                    timeout: 50000
                },
                container : {
                    primary : "ciaas-nodejs"
                },
                skipSetup : true,
                reposity : {
                    uri : "https://github.com/jashkenas/underscore.git",
                    name: "underscore",
                    branch : "master"
                },
                payload: {
                    commands: [
                        "echo 'Hello world'"
                    ]
                }
            };

            var queue = Queue('build', 6379, '127.0.0.1');
            var result = Queue('result', 6379, '127.0.0.1');
            var client = new Client('127.0.0.1', 6379, logger);
            result.process(function (job) {
                client.close();
                result.close();
                queue.close();
                done();
            });
            queue.empty().then(function () {
                return queue.add(item);
            });

        });
    });
});