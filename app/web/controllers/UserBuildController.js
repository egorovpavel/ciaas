'use strict';
var ConvertAsci = require('ansi-to-html');
var _ = require('lodash');
var redis = require('redis');
var Authorization = require('./../common/Authorization');
function UserBuildController(app) {
    var logger = app.get('logger');
    var convert = new ConvertAsci();
    var Projects = app.get("repos").ProjectsRepo;
    var Accounts = app.get("repos").AccountsRepo;
    var Builds = app.get("repos").BuildsRepo;
    var BuildQueue = app.get("repos").BuildQueueRepo(app.get('redisPort'), app.get('redisHost'));
    var GitHubRemote = app.get("repos").GitHubRemoteRepo;
    var redisFeedSubscriber = redis.createClient(app.get('redisPort'), app.get('redisHost'));

    app.get('/projects/:id/build',Authorization.isAuthenticated, function (req, res) {
        var viewbag = {};
        Projects.get(req.param('id')).then(function (project) {
            viewbag.project = project;
            return Builds.all(project)
        }).then(function (builds) {
            viewbag.builds = builds;
            res.render('build/list.html', viewbag);
        }).catch(function (err) {
            if (err) {
                logger.info(err);
                res.status(404);
            }
        }).finally(function () {
            logger.info("BUILDS LIST");
        });
    });
    
    app.post('/projects/:id/build',Authorization.isAuthenticated, function (req, res) {
        var _buildid;
        var _project;
        var _branch;
        var _id;
        Projects.get(req.param('id')).then(function (project) {
            _project = project;
            return GitHubRemote.getHeadCommitInfo(req.user.token,req.user.username,project.name, project.default_branch);
        }).then(function(branch){
            _branch = branch;
            return Builds.open(_project,{
                commit_id : branch.commit.sha,
                commit_message : branch.commit.commit.message,
                commit_author : branch.commit.commit.committer.name
            });
        }).then(function (build) {
            _id = build.id;
            _buildid = build.build_id;
            return _project.getContainer();
        }).then(function (container) {
            var job = {
                _id: _id,
                id: _buildid,
                config: {
                    language: "JS",
                    timeout: 500000
                },
                container: {
                    primary: container.name
                },
                reposity: {
                    uri: _project.repo_url,
                    name: _project.name,
                    branch : _project.default_branch
                },
                skipSetup: false,
                payload: {
                    commands: _project.command.split("\n")
                }
            };
            return BuildQueue.add(job);
        }).then(function (build) {
            res.redirect('/projects/' + req.param('id') + "/build/" + _buildid);
        }).catch(function (err) {
            if (err) {
                logger.error(err);
                res.status(500);
            }
        }).finally(function () {
            logger.info("build DONE");
        });
    });

    app.get('/projects/:id/build/:num',Authorization.isAuthenticated, function (req, res) {
        var viewbag = {};
        Projects.get(req.param('id')).then(function (project) {
            viewbag.project = project;
            return Builds.get(project, req.param('num'));
        }).then(function (build) {
            viewbag.build = build;
            if (build.status_exec == 'COMPLETE') {
                viewbag.log = [];
                _.each(build.log_build, function (l) {
                    if (/\r/.test(l) && /\r/.test(viewbag.log[viewbag.log.length - 1])) {
                        logger.info("pop");
                        viewbag.log.pop();
                    } else {
                        viewbag.log.push(convert.toHtml(l));
                    }
                });
                logger.info("COMPLETE" + viewbag);
                res.render('build/detail_static.html', viewbag);
            } else {
                res.render('build/detail.html', viewbag);
            }
        }).catch(function (err) {
            if (err) {
                logger.info(err);
                res.status(404);
            }
        }).finally(function () {
            logger.info("ACCOUNT LIST");
        });
    });

}

module.exports = UserBuildController;
