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
	var handle = function(data, done){
        if(data.artifact.produce){
            var params = {
                localFile: data.artifact.path,
                s3Params: {
                    Bucket: process.env.S3_BUCKET || "dev-artifact",
                    Key: data.artifact.name + '_' + Path.basename(data.artifact.path),
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
                done(null,data.artifact.name + '_' + Path.basename(data.artifact.path));
            });
        }else{
            done(null,null);
        }
	};
	return {
		handle : handle
	}
};

module.exports = S3ArtifactPersistanceHandler;