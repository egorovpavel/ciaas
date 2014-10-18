'use strict';
var s3 = require('s3');
var tmp = require('temporary');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

var S3LogPersistanceHandler = function(config,logger){
	var client = s3.createClient({
	  s3Options: {
	    accessKeyId: process.env.AWS_KEY,
	    secretAccessKey: process.env.AWS_SECRET
	  }
	});
	var handle = function(build, done){
		var file = new tmp.File();
		var params = {
		  localFile: file.path,
		  s3Params: {
		    Bucket: process.env.S3_BUCKET || "dev-results",
		    Key: "build_" + build.id,
		    ACL : "public-read"
		  }
		};

		logger.log("S3:",params);
		file.writeFile(JSON.stringify(build.entries), function(err){
			if (err){
				done(err);
			}
			var uploader = client.uploadFile(params);
			uploader.on('error', function(err) {
				if(err){
					done(err);
				}
			});
			uploader.on('end', function() {
				done();
			});
		});
	};
	return {
		handle : handle
	}
};

module.exports = S3LogPersistanceHandler;