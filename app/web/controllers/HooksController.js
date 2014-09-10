'use strict';

var HooksController = function(app){
	var logger = app.get('logger');
    app.post('/hooks', function (req, res) {
    	logger.info(request.body);
        res.write('OK');
    });
};

module.exports = HooksController;