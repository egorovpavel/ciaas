'use strict';
var s3 = require('s3');
var Path = require('path');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var S3ArtifactPersistanceHandler = function(logger){
	var client = s3.createClient({
        s3RetryCount: 6,    // this is the default
        s3RetryDelay: 1000,
        s3Options: {
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET
        }
	});
	var handle = function(path, name, done){
		var params = {
		  localFile: path,
		  s3Params: {
		    Bucket: process.env.S3_BUCKET || "dev-artifact",
		    Key: name + '_' + Path.basename(path),
		    ACL : "public-read"
		  }
		};
        var uploader = client.uploadFile(params);
        uploader.on('error', function(err) {
            if(err){
                console.log("UPLOAD FAILED:",err);
                done(err);
            }
        });
        uploader.on('end', function() {
            done(null,name + '_' + Path.basename(path));
        });
	};
	return {
		handle : handle
	}
};

module.exports = S3ArtifactPersistanceHandler;