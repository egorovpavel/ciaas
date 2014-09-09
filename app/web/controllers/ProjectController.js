'use strict';
var Authorization = require('./../common/Authorization');
function ProjectController(app) {
    var logger = app.get('logger');
    var Projects = app.get("repos").ProjectsRepo;
    var Accounts = app.get("repos").AccountsRepo;
    var GitHubRemote = app.get("repos").GitHubRemoteRepo;
    var Containers = app.get("repos").ContainersRepo;

    app.get('/dashboard/account/:username/project',Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        var acc;
        Accounts.getByUsername(req.param('username')).then(function (account) {
            acc = account;
            return  Projects.all(account);
        }).then(function (projects) {
            res.render('dashboard/project/list.html', {
                req : req,
                account: acc,
                projects: projects
            });
        }).catch(function (err) {
            if (err) {
                logger.log(err);
                res.status(404);
            }
        }).finally(function () {
            logger.log("ACCOUNT LIST");
        });
    });

    app.post('/dashboard/account/:username/project/create',Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.getByUsername(req.param('username')).then(function (account) {
            return Projects.create(account, req.body.project);
        }).then(function () {
            res.redirect('/dashboard/account/' + req.param('username') + '/project');
        }).catch(function (err) {
            if (err) {
                if (err.code && err.code == 'ER_DUP_ENTRY') {
                    err = {
                        repo_url: ["Project with this repository already exists"]
                    };
                }
                Containers.getPrimary().then(function (containers) {
                    res.render('dashboard/project/form.html', {
                        req : req,
                        errors: err,
                        containers: containers,
                        project: req.body.project
                    });
                })
            }
        }).finally(function () {
            logger.log("ACCOUNT DONE");
        });
    });

    app.get('/dashboard/account/:username/project/create',Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Containers.getPrimary().then(function (containers) {
            res.render('dashboard/project/form.html', {
                req : req,
                containers: containers
            });
        }).catch(function (err) {
            if (err) {
                logger.log(err);
                res.status(500);
            }
        }).finally(function () {
            logger.log("ACCOUNT DONE");
        });

    });

    app.get('/dashboard/account/:username/project/:id/delete',Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        var acc;
        Accounts.getByUsername(req.param('username'))
            .then(function (account) {
                acc = account;
                return Projects.get(req.param('id'))
            })
            .then(function (project) {
                res.render('dashboard/project/delete.html', {
                    req : req,
                    account: acc,
                    project: project
                });
            })
            .catch(function (err) {
                if (err) {
                    logger.log(err);
                    res.status(404);
                }
            })
            .finally(function () {
                logger.log("ACCOUNT delete show");
            });
    });

    app.post('/dashboard/account/:username/project/:id/delete',Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Projects.delete(req.param('id'))
            .then(function () {
                res.redirect('/dashboard/account/' + req.param('username') + '/project');
            })
            .catch(function (err) {
                if (err) {
                    logger.log(err);
                    res.status(501);
                }
            })
            .finally(function () {
                logger.log("ACCOUNT deleteed");
            });
    });

    app.get('/dashboard/account/:username/project/:id/edit',Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        var _containers;
        var _account;
        Accounts.getByUsername(req.param('username')).then(function (account) {
            _account = account;
            return Containers.getPrimary();
        }).then(function (containers) {
            _containers = containers;
            return Projects.get(req.param('id'));
        }).then(function (project) {
            logger.log(project);
            res.render('dashboard/project/form.html', {
                req : req,
                containers: _containers,
                project: project,
                account: _account
            });
        }).catch(function (err) {
            logger.log(err);
            if (err) {
                res.status(404);
            }
        })
            .finally(function () {
                logger.log("ACCOUNT DONE");
            });
    });

    app.post('/dashboard/account/:username/project/:id/edit',Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        var _account;
        Accounts.getByUsername(req.param('username')).then(function (account) {
            _account = account;
            return Projects.update(req.param('id'), req.body.project);
        }).then(function () {
            res.redirect('/dashboard/account/' + req.param('username') + '/project');
        }).catch(function (err) {
            if (err) {
                if (err.code && err.code == 'ER_DUP_ENTRY') {
                    err = {
                        repo_url: ["Project for this repository already exists"]
                    };
                }
                logger.log(err);
                req.body.project.id = "dummy";

                Containers.getPrimary().then(function (containers) {
                    res.render('dashboard/project/form.html', {
                        req : req,
                        errors: err,
                        account: _account,
                        containers: containers,
                        project: req.body.project
                    });
                });
            }
        }).finally(function () {
            logger.log("ACCOUNT DONE");
        });
    });

    app.get('/dashboard/account/:username/project/:id',Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        var _account;
        Accounts.getByUsername(req.param('username')).then(function (account) {
            _account = account;
            return Projects.get(req.param('id'));
        }).then(function (project) {
            res.render('dashboard/project/detail.html', {
                req : req,
                account: _account,
                project: project
            });
        }).catch(function (err) {
            logger.log(err);
            if (err) {
                res.status(500);
            }
        }).finally(function () {
            logger.log("ACCOUNT DONE");
        });
    });

}

module.exports = ProjectController;