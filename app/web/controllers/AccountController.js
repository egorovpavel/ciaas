'use strict';

function AccountController(app) {
    var Accounts = app.get("repos").AccountsRepo;

    app.get('/account', function (req, res) {
        Accounts.all().then(function (accounts) {
            res.render('account/list.html', {
                accounts: accounts
            });
        }).catch(function (err) {
            if (err) {
                console.log(err);
                res.responseError(501);
            }
        }).finally(function () {
            console.log("ACCOUNT LIST");
        });
    });

    app.get('/account/create', function (req, res) {
        res.render('account/form.html');
    });

    app.get('/account/:username', function (req, res) {
        Accounts.getByUsername(req.param('username')).then(function (account) {
            res.render('account/detail.html', {
                account: account
            });
        })
            .catch(function (err) {
                console.log(err);
                if (err) {
                    res.responseError(501);
                }
            })
            .finally(function () {
                console.log("ACCOUNT DONE");
            });
    });

    app.get('/account/:username/edit', function (req, res) {
        Accounts.getByUsername(req.param('username')).then(function (account) {
            res.render('account/form.html', {
                account: account
            });
        })
            .catch(function (err) {
                console.log(err);
                if (err) {
                    res.status(404);
                }
            })
            .finally(function () {
                console.log("ACCOUNT DONE");
            });
    });

    app.post('/account/:username/edit', function (req, res) {
        Accounts.update(req.param('username'), req.body.account)
            .then(function (account) {
                res.redirect('/account/' + account.username);
            })
            .catch(function (err) {
                if (err) {

                    if (err.code && err.code == 'ER_DUP_ENTRY') {
                        err = {
                            username: ["User with this name already exists"]
                        };
                    }
                    console.log(err);
                    req.body.account.id = "dummy";
                    res.render('account/form.html', {
                        errors: err,
                        account: req.body.account
                    });
                }
            })
            .finally(function () {
                console.log("ACCOUNT DONE");
            });
    });

    app.post('/account/create', function (req, res) {
        Accounts.create(req.body.account)
            .then(function (account) {
                res.redirect('/account/' + account.username);
            })
            .catch(function (err) {
                if (err) {
                    console.log();
                    if (err.code && err.code == 'ER_DUP_ENTRY') {
                        var key = err.message.indexOf("for key 'email'") > 0 ? "email" : "username";
                        err = {};
                        err[key] = [key + " already exists"];
                    }
                    console.log(err);
                    res.render('account/form.html', {
                        errors: err,
                        account: req.body.account
                    });
                }
            })
            .finally(function () {
                console.log("ACCOUNT DONE");
            });
    });

    app.get('/account/:username/delete', function (req, res) {
        Accounts.getByUsername(req.param('username'))
            .then(function (account) {
                res.render('account/delete.html', {
                    account: account
                });
            })
            .catch(function (err) {
                if (err) {
                    console.log(err);
                    res.responseError(501);
                }
            })
            .finally(function () {
                console.log("ACCOUNT delete show");
            });
    });

    app.post('/account/:username/delete', function (req, res) {
        Accounts.delete(req.param('username'))
            .then(function (account) {
                res.redirect('/account');
            })
            .catch(function (err) {
                if (err) {
                    console.log(err);
                    res.responseError(501);
                }
            })
            .finally(function () {
                console.log("ACCOUNT deleteed");
            });
    });

};

module.exports = AccountController;