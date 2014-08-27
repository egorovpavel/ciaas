"use strict";
require('should');
var Worker = require('../lib/worker.js');
describe('Worker', function() {
    describe('Should create build script from array', function () {
        it('Creates valid shell script from array', function (done, fail) {
            var worker = new Worker();
            var data = {
            	reposity : {
	                uri : "https://github.com/jashkenas/underscore.git",
                    name: "underscore"
	            },
	            skipSetup : false,
	            payload: {
	                commands: [
                        "echo 'Hello world'"
		            ]
	            }
            };
            var expected = "(git clone "+data.reposity.uri+" && cd "+data.reposity.name+";echo '$ echo 'Hello world''; echo 'Hello world' || exit 1;)";
            var script = worker.prepare(data);
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
				skipSetup : true,
            	reposity : {
	                uri : "https://github.com/jashkenas/underscore.git",
                    name: "underscore"
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
            	reposity : {
	                uri : "https://github.com/jashkenas/underscore.git",
                    name: "underscore"
	            },
	            skipSetup : true,
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
					timeout: 1000
				},
            	reposity : {
	                uri : "https://github.com/jashkenas/underscore.git",
	                name :  "underscore",
	            },
	            skipSetup : true,
				payload: {
					commands: [
						"sleep 2"
					]
				}
			};

            worker.put(item).on('timeout', function (data) {
				data.StatusCode.should.be.equal(100);
				done();
			});
		});
	});
});