'use strict';

var HooksController = function(app){
    app.get('/hooks', function (req, res) {
        res.write('OK');
    });
};

module.exports = HooksController;