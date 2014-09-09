'use strict';
var Authorization = require('./../common/Authorization');
function AccountController(app) {
    var logger = app.get('logger');
    var Accounts = app.get("repos").AccountsRepo;
    app.get('/dashboard/account', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.all().then(function (accounts) {
            res.render('dashboard/account/list.html', {
                req : req,
                accounts: accounts
            });
        }).catch(function (err) {
            if (err) {
                logger.info(err);
                res.responseError(501);
            }
        }).finally(function () {
            logger.info("ACCOUNT LIST");
        });
    });

    app.get('/dashboard/account/create', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        res.render('dashboard/account/form.html',{req : req});
    });

    app.get('/dashboard/account/:username', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.getByUsername(req.param('username')).then(function (account) {
            res.render('dashboard/account/detail.html', {
                req : req,
                account: account
            });
        })
            .catch(function (err) {
                logger.info(err);
                if (err) {
                    res.responseError(501);
                }
            })
            .finally(function () {
                logger.info("ACCOUNT DONE");
            });
    });

    app.get('/dashboard/account/:username/edit', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.getByUsername(req.param('username')).then(function (account) {
            res.render('dashboard/account/form.html', {
                req : req,
                account: account
            });
        })
            .catch(function (err) {
                logger.info(err);
                if (err) {
                    res.status(404);
                }
            })
            .finally(function () {
                logger.info("ACCOUNT DONE");
            });
    });

    app.post('/dashboard/account/:username/edit', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.update(req.param('username'), req.body.account)
            .then(function (account) {
                res.redirect('/dashboard/account/' + account.username);
            })
            .catch(function (err) {
                if (err) {

                    if (err.code && err.code == 'ER_DUP_ENTRY') {
                        err = {
                            username: ["User with this name already exists"]
                        };
                    }
                    logger.info(err);
                    req.body.account.id = "dummy";
                    res.render('dashboard/account/form.html', {
                        req : req,
                        errors: err,
                        account: req.body.account
                    });
                }
            })
            .finally(function () {
                logger.info("ACCOUNT DONE");
            });
    });

    app.post('/dashboard/account/create', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.create(req.body.account)
            .then(function (account) {
                res.redirect('/dashboard/account/' + account.username);
            })
            .catch(function (err) {
                if (err) {
                    logger.info();
                    if (err.code && err.code == 'ER_DUP_ENTRY') {
                        var key = err.message.indexOf("for key 'email'") > 0 ? "email" : "username";
                        err = {};
                        err[key] = [key + " already exists"];
                    }
                    logger.info(err);
                    res.render('dashboard/account/form.html', {
                        req : req,
                        errors: err,
                        account: req.body.account
                    });
                }
            })
            .finally(function () {
                logger.info("ACCOUNT DONE");
            });
    });

    app.get('/dashboard/account/:username/delete', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.getByUsername(req.param('username'))
            .then(function (account) {
                res.render('dashboard/account/delete.html', {
                    req : req,
                    account: account
                });
            })
            .catch(function (err) {
                if (err) {
                    logger.info(err);
                    res.responseError(501);
                }
            })
            .finally(function () {
                logger.info("ACCOUNT delete show");
            });
    });

    app.post('/dashboard/account/:username/delete', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.delete(req.param('username'))
            .then(function (account) {
                res.redirect('/dashboard/account');
            })
            .catch(function (err) {
                if (err) {
                    logger.info(err);
                    res.responseError(501);
                }
            })
            .finally(function () {
                logger.info("ACCOUNT deleteed");
            });
    });

};

module.exports = AccountController;