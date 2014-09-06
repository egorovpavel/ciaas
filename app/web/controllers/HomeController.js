'use strict';

var HomeController = function (app) {

    app.get('/', function (req, res) {
        res.render('home/home.html',{req:req});
    });

    app.get('/about', function (req, res) {
        res.render('login/about.html',{req:req});
    });

};

module.exports = HomeController;