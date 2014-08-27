'use strict';

var HomeController = function (app) {

    app.get('/', function (req, res) {
        res.render('home/home.html');
    });

    app.get('/about', function (req, res) {
        res.render('login/about.html');
    });

};

module.exports = HomeController;