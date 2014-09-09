'use strict';

var HooksController = function(app){
	var logger = app.get('logger');
    app.get('/hooks', function (req, res) {
        res.write('OK');
    });
};

module.exports = HooksController;