'use strict';

function ProjectController(app) {

    var Projects = app.get("repos").ProjectsRepo;
    var Accounts = app.get("repos").AccountsRepo;
    var GitHubRemote = app.get("repos").GitHubRemoteRepo;
    var Containers = app.get("repos").ContainersRepo;

    app.get('/account/:username/project', function (req, res) {
        var acc;
        Accounts.getByUsername(req.param('username')).then(function (account) {
            acc = account;
            return  Projects.all(account);
        }).then(function (projects) {
            res.render('project/list.html', {
                account: acc,
                projects: projects
            });
        }).catch(function (err) {
            if (err) {
                console.log(err);
                res.status(404);
            }
        }).finally(function () {
            console.log("ACCOUNT LIST");
        });
    });

    app.post('/account/:username/project/create', function (req, res) {
        Accounts.getByUsername(req.param('username')).then(function (account) {
            return Projects.create(account, req.body.project);
        }).then(function () {
            res.redirect('/account/' + req.param('username') + '/project');
        }).catch(function (err) {
            if (err) {
                if (err.code && err.code == 'ER_DUP_ENTRY') {
                    err = {
                        repo_url: ["Project with this repository already exists"]
                    };
                }
                Containers.getPrimary().then(function (containers) {
                    res.render('project/form.html', {
                        errors: err,
                        containers: containers,
                        project: req.body.project
                    });
                })
            }
        }).finally(function () {
            console.log("ACCOUNT DONE");
        });
    });

    app.get('/account/:username/project/create', function (req, res) {
        Containers.getPrimary().then(function (containers) {
            res.render('project/form.html', {
                containers: containers
            });
        }).catch(function (err) {
            if (err) {
                console.log(err);
                res.status(500);
            }
        }).finally(function () {
            console.log("ACCOUNT DONE");
        });

    });

    app.get('/account/:username/project/:id/delete', function (req, res) {
        var acc;
        Accounts.getByUsername(req.param('username'))
            .then(function (account) {
                acc = account;
                return Projects.get(req.param('id'))
            })
            .then(function (project) {
                res.render('project/delete.html', {
                    account: acc,
                    project: project
                });
            })
            .catch(function (err) {
                if (err) {
                    console.log(err);
                    res.status(404);
                }
            })
            .finally(function () {
                console.log("ACCOUNT delete show");
            });
    });

    app.post('/account/:username/project/:id/delete', function (req, res) {
        Projects.delete(req.param('id'))
            .then(function () {
                res.redirect('/account/' + req.param('username') + '/project');
            })
            .catch(function (err) {
                if (err) {
                    console.log(err);
                    res.status(501);
                }
            })
            .finally(function () {
                console.log("ACCOUNT deleteed");
            });
    });

    app.get('/account/:username/project/:id/edit', function (req, res) {
        var _containers;
        var _account;
        Accounts.getByUsername(req.param('username')).then(function (account) {
            _account = account;
            return Containers.getPrimary();
        }).then(function (containers) {
            _containers = containers;
            return Projects.get(req.param('id'));
        }).then(function (project) {
            console.log(project);
            res.render('project/form.html', {
                containers: _containers,
                project: project,
                account: _account
            });
        }).catch(function (err) {
            console.log(err);
            if (err) {
                res.status(404);
            }
        })
            .finally(function () {
                console.log("ACCOUNT DONE");
            });
    });

    app.post('/account/:username/project/:id/edit', function (req, res) {
        var _account;
        Accounts.getByUsername(req.param('username')).then(function (account) {
            _account = account;
            return Projects.update(req.param('id'), req.body.project);
        }).then(function () {
            res.redirect('/account/' + req.param('username') + '/project');
        }).catch(function (err) {
            if (err) {
                if (err.code && err.code == 'ER_DUP_ENTRY') {
                    err = {
                        repo_url: ["Project for this repository already exists"]
                    };
                }
                console.log(err);
                req.body.project.id = "dummy";

                Containers.getPrimary().then(function (containers) {
                    res.render('project/form.html', {
                        errors: err,
                        account: _account,
                        containers: containers,
                        project: req.body.project
                    });
                });
            }
        }).finally(function () {
            console.log("ACCOUNT DONE");
        });
    });

    app.get('/account/:username/project/:id', function (req, res) {
        var _account;
        Accounts.getByUsername(req.param('username')).then(function (account) {
            _account = account;
            return Projects.get(req.param('id'));
        }).then(function (project) {
            res.render('project/detail.html', {
                account: _account,
                project: project
            });
        }).catch(function (err) {
            console.log(err);
            if (err) {
                res.status(500);
            }
        }).finally(function () {
            console.log("ACCOUNT DONE");
        });
    });

}

module.exports = ProjectController;