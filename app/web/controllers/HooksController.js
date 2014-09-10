'use strict';

var HooksController = function(app){
	var logger = app.get('logger');
    app.post('/hooks', function (req, res) {
    	logger.info(req.body);
        res.write('OK');
    });
};

module.exports = HooksController;