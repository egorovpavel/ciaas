"use strict";
require('should');
var Worker = require('../lib/Worker.js');
describe('Worker', function() {
    describe('Should create build script from array', function () {
        it('Creates valid shell script from array', function (done, fail) {
            var worker = new Worker();
            var data = {
            	reposity : {
	                uri : "https://github.com/jashkenas/underscore.git",
                    name: "underscore",
                    branch : "master"
	            },
	            skipSetup : false,
	            payload: {
	                commands: [
                        "echo 'Hello world'"
		            ]
	            }
            };
            //(cd /home/user && git clone https://github.com/jashkenas/underscore.git -b master .;echo '\u001b[32m$ echo 'Hello world'\u001b[0m'; echo 'Hello world' || exit 1;)
            var checkoutpath = "/home/user";
            var expected = "(cd "+checkoutpath+" && git clone "+data.reposity.uri+" -b "+data.reposity.branch+" .;echo '\u001b[32m$ echo 'Hello world'\u001b[0m'; echo 'Hello world' || exit 1;)";

            var script = worker.prepare(data,checkoutpath);
            script.should.be.equal(expected);
            done();
        });
    });
	describe('Should execute build inside container', function() {
		it('Exit with status code 0 for successful build', function(done, fail) {
			this.timeout(5000);
			var worker = new Worker();
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

            var container = worker.put(item);

            container.on('complete', function (data) {
				data.StatusCode.should.be.equal(0);
				done();
			});
		});

		it('Exit with status code different than 0 for failed build', function(done, fail) {
			this.timeout(5000);
			var worker = new Worker();
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
						"this must fail"
					]
				}
			};

			worker.put(item).on('complete', function(data) {
				data.StatusCode.should.be.not.equal(0);
				done();
			});
		});

		it('Exit with status code 100 by timeout', function(done, fail) {
			this.timeout(5000);
			var worker = new Worker();
			var item = {
				config: {
					language: "JS",
					timeout: 2000
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
						"sleep 20"
					]
				}
			};

            worker.put(item).on('timeout', function (data) {
				data.StatusCode.should.be.equal(100);
				done();
			});
		});

        it('Run primary and secondary container', function(done, fail) {
            this.timeout(50000000);
            var worker = new Worker();
            var item = {
                config: {
                    language: "JS",
                    timeout: 200000
                },
                container : {
                    primary : "ciaas-nodejs",
                    secondary : [
                        {
                            image : "redis",
                            name : "unique_id",
                            alias : "redis_alias",
                            command : "redis-server"
                        }
                    ]
                },
                skipSetup : true,
                reposity : {
                    uri : "https://github.com/jashkenas/underscore.git",
                    name: "underscore",
                    branch : "master"
                },
                payload: {
                    commands: ["redis-cli -h redis_alias ping"]
                }
            };

            worker.put(item).on('complete', function (data) {
                data.StatusCode.should.be.equal(0);
                done();
            });
        });

        it('Run primary and secondary container and handles timeout correctly', function(done, fail) {
            this.timeout(50000000);
            var worker = new Worker();
            var item = {
                config: {
                    language: "JS",
                    timeout: 2000
                },
                container : {
                    primary : "ciaas-nodejs",
                    secondary : [
                        {
                            image : "redis",
                            name : "unique_id",
                            alias : "redis_alias",
                            command : "redis-server"
                        }
                    ]
                },
                skipSetup : true,
                reposity : {
                    uri : "https://github.com/jashkenas/underscore.git",
                    name: "underscore",
                    branch : "master"
                },
                payload: {
                    commands: ["sleep 10"]
                }
            };

            worker.put(item).on('timeout', function (data) {
                data.StatusCode.should.be.equal(100);
                done();
            });
        });

        it('Post process executed', function(done, fail) {
            this.timeout(50000000);
            var worker = new Worker({
                postProcess : function(result, cb){
                    cb(null,result);
                    done();
                }
            });
            var item = {
                config: {
                    language: "JS",
                    timeout: 2000
                },
                container : {
                    primary : "ciaas-nodejs",
                    secondary : [
                        {
                            image : "redis",
                            name : "unique_id",
                            alias : "redis_alias",
                            command : "redis-server"
                        }
                    ]
                },
                skipSetup : true,
                reposity : {
                    uri : "https://github.com/jashkenas/underscore.git",
                    name: "underscore",
                    branch : "master"
                },
                payload: {
                    commands: ["echo OK"]
                }
            };

            worker.put(item);
        });
	});
});