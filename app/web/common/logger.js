'use strict';
var winston = require('winston');
var Logentries = require('winston-logentries');
// Logger configuration
// ====================
//
// Configures Logger instance. Uses `winston` library to log to different destinations
var Logger = function (env) {
    var logger = new winston.Logger();
    if(env == 'production'){
        logger.add(winston.transports.Logentries,{handleExceptions: true,token: process.env.LOGENTRIES_TOKEN || 'dc629fed-e059-4449-9883-d43d2279051c'});
    }
    logger.add(winston.transports.Console,{handleExceptions: true});

    return logger;
};

module.exports = Logger;
