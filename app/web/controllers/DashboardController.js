'use strict';
var Authorization = require('./../common/Authorization');
var DashboardController = function (app) {
	var logger = app.get('logger');
    var Accounts = app.get("repos").AccountsRepo;
    var Builds = app.get("repos").BuildsRepo;
    var Projects = app.get("repos").ProjectsRepo;
    var Containers = app.get("repos").ContainersRepo;

    app.get('/dashboard',Authorization.isAdmin, function (req, res) {
        var viewbag = {};
        Accounts.count().then(function(num){
            viewbag.numAccounts = num;
            return Builds.count();
        }).then(function(num){
            viewbag.numBuilds = num;
            return Projects.count();
        }).then(function(num){
            viewbag.numProjects = num;
            return Containers.count();
        }).then(function(num){
            viewbag.numContainers = num;
            res.render('dashboard/dashboard/index.html',viewbag);
        }).catch(function(){
            res.status(500);
            res.end();
        }).finally(function(){
            logger.info("dashboard");
        });
    });
};

module.exports = DashboardController;