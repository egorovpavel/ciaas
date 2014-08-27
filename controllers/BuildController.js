'use strict';
var ConvertAsci = require('ansi-to-html');
var _ = require('lodash');
var redis = require('redis');
function BuildController(app) {
    var convert = new ConvertAsci();
    var Projects = app.get("repos").ProjectsRepo;
    var Accounts = app.get("repos").AccountsRepo;
    console.log("---------------------------BuildController",[app.get('redisPort'), app.get('redisHost')]);
    var Builds = app.get("repos").BuildsRepo;
    var BuildQueue = app.get("repos").BuildQueueRepo(app.get('redisPort'), app.get('redisHost'));
    var redisFeedSubscriber = redis.createClient(app.get('redisPort'), app.get('redisHost'));

    app.get('/account/:username/project/:id/build', function (req, res) {
        var viewbag = {};
        Accounts.getByUsername(req.param('username')).then(function (account) {
            viewbag.account = account;
            return  Projects.get(req.param('id'));
        }).then(function (project) {
            viewbag.project = project;
            return Builds.all(project)
        }).then(function (builds) {
            viewbag.builds = builds;
            res.render('build/list.html', viewbag);
        }).catch(function (err) {
            if (err) {
                console.log(err);
                res.status(404);
            }
        }).finally(function () {
            console.log("BUILDS LIST");
        });
    });

    app.io.route('rt.build.feed', function (req) {

        var id = req.data._id;
        var OutputFeed = app.get("repos").OutputFeedRepo(app.get('redisPort'), app.get('redisHost'));
        redisFeedSubscriber.on('message', function (channel, message) {
            if (channel == "channel_result_" + id) {
                req.io.emit("channel_result_" + id, JSON.parse(message));
                redisFeedSubscriber.unsubscribe("channel_result_" + id);
                redisFeedSubscriber.unsubscribe("channel_" + id);
            } else if(channel == "channel_" + id) {
                OutputFeed.transform(id, message, function (channelName, message) {
                    req.io.emit(channelName, message);
                });
            }
        });
        redisFeedSubscriber.subscribe("channel_" + id);
        redisFeedSubscriber.subscribe("channel_result_" + id);

    });
    app.post('/account/:username/project/:id/build', function (req, res) {
        var _buildid;
        var _project;
        var _id;
        Projects.get(req.param('id')).then(function (project) {
            _project = project;
            return Builds.open(project);
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
                    name: _project.name
                },
                skipSetup: false,
                payload: {
                    commands: _project.command.split("\n")
                }
            };
            return BuildQueue.add(job);
        }).then(function (build) {
            res.redirect('/account/' + req.param('username') + '/project/' + req.param('id') + "/build/" + _buildid);
        }).catch(function (err) {
            if (err) {
                res.status(500);
            }
        }).finally(function () {
            console.log("build DONE");
        });
    });

    app.get('/account/:username/project/:id/build/:num', function (req, res) {
        var viewbag = {};
        Accounts.getByUsername(req.param('username')).then(function (account) {
            viewbag.account = account;
            return  Projects.get(req.param('id'));
        }).then(function (project) {
            viewbag.project = project;
            console.log(viewbag);
            return Builds.get(project, req.param('num'));
        }).then(function (build) {
            viewbag.build = build;

            if (build.status_exec == 'COMPLETE') {
                viewbag.log = [];
                _.each(build.log_build, function (l) {
                    if (/\r/.test(l) && /\r/.test(viewbag.log[viewbag.log.length - 1])) {
                        console.log("pop");
                        viewbag.log.pop();
                    } else {
                        viewbag.log.push(convert.toHtml(l));
                    }
                });
                console.log("COMPLETE", viewbag);
                res.render('build/detail_static.html', viewbag);
            } else {
                res.render('build/detail.html', viewbag);
            }
        }).catch(function (err) {
            if (err) {
                console.log(err);
                res.status(404);
            }
        }).finally(function () {
            console.log("ACCOUNT LIST");
        });
    });

}

module.exports = BuildController;