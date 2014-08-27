"use strict";
require('should');
var Hub = require('../lib/hub.js');
describe('Hub', function() {
    describe('Should handle build result from result queue', function () {
        it('Creates valid shell script from array', function (done, fail) {
            var worker = new Hub();
            var result = {
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
});