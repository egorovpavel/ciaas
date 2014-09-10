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


	var getAllRepos = function(token){
		var promise = Promise.pending();
		github.authenticate({
		    type: "oauth",
		    token: token
		});
		github.repos.getAll({type: "owner"},function(err,data){
			if(err){
				promise.reject(err);
			}else{
				promise.resolve(data);
			}
		});
		return promise.promise;
	};

	var getRepo = function(token,user,repo){
		var promise = Promise.pending();
		github.authenticate({
		    type: "oauth",
		    token: token
		});
		github.repos.get({
			user : user,
			repo : repo
		},function(err,data){
			if(err){
				promise.reject(err);
			}else{
				promise.resolve(data);
			}
		});
		return promise.promise;
	};

	var registerHook = function(token,user,repo){
		var promise = Promise.pending();
		github.authenticate({
		    type: "oauth",
		    token: token
		});
		github.repos.createHook({
			user : user,
			repo : repo,
			name : "web",
			active : true,
			events: [
			    "push",
			    "pull_request"
		    ],
			config : {
				url : "http://cipsisel.com/hooks",
      			content_type : "json"
			}
		},function(err,data){
			if(err){
				promise.reject(err);
			}else{
				promise.resolve(data);
			}
		});
		return promise.promise;
	};

	return {
		getAllRepos : getAllRepos,
		getRepo : getRepo,
		registerHook: registerHook
	}
}();

module.exports = GitHubRemoteRepo;