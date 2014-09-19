'use strict';
var Authorization = require('./../common/Authorization');
var HomeController = function (app) {
	var logger = app.get('logger');
    app.get('/',Authorization.isGuest, function (req, res) {
        res.render('home/home.html');
    });

    app.get('/about',Authorization.isGuest, function (req, res) {
        res.render('login/about.html');
    });

};

module.exports = HomeController;