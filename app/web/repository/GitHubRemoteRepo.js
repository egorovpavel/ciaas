'use strict';

var GitHubAPI = require('github');
var Promise = require('bluebird');

var GitHubRemoteRepo = function () {
	var github = new GitHubAPI({
	    version: "3.0.0",
	    debug: true,
	    protocol: "https",
	    host: "api.github.com",
	    timeout: 5000
	});


	var authorizeAccess = function(){
		var promise = Promise.pending();
		github.authenticate({
		    type: "oauth",
		    key: "f6bf18dd474f62e7ccc0",
		    secret: "01c08580bb27243720e338213150b54357b53a1d"
		});
		github.authorization.create({
		    scopes: ["user", "public_repo", "repo", "write:repo_hook"],
		    note: "what this auth is for",
		    note_url: "http://url-to-this-auth-app"
		}, function(err, res) {
			if(err){
				promise.reject(err);
			}
		    if (res.token) {
		        console.log(res.token);
		        promise.resolve(res.token);
		    }
		});
		return promise.promise;
	};

	return {
		authorizeAccess : authorizeAccess
	}
}();

module.exports = GitHubRemoteRepo;