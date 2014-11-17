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
                    Key: data.artifact.name,
                    ACL : "public-read"
                }
            };
            var uploader = client.uploadFile(params);
            uploader.on('error', function(err) {
                if(err){
                    data.artifact.name = '';
                    console.log("UPLOAD FAILED:",err);
                    done(err,data);
                }
            });
            uploader.on('end', function() {
                data.artifact.name = data.artifact.name + '_' + Path.basename(data.artifact.path);
                done(null,data);
            });
        }else{
            done(null,data);
        }
	};
	return {
		handle : handle
	}
};

module.exports = S3ArtifactPersistanceHandler;