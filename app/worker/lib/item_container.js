"use strict";
// Result stream
// =============
//
// TODO: describe dependencies
//
var stream = require("stream");
var Writable = stream.Writable;
var _ = require('lodash');
var util = require('util');

// Implements Writable stream so we be able to pipe into docker container
// output stream
//

// Constructor function - handles stream initialization
//
// Arguments:
// - `item` __literal__
// - callback __function__ executed once stream ready to write line of output
// - options __Stream options__
var Container = function (item, callback, options) {
    this.callback = callback;

    // Build Id
    this.id = item.id;
    // Line number
    this.lineNum = 0;
    this.item = item;

    // Buffer to hold incomplete chunks (it will be complete once line feed or carriage return detected)
    this.lineBuffer = "";
    options = !options ? {} : options;
    options.objectMode = true;

    // Calling parent constructor
    Writable.call(this, options);
};

// Inheriting from StreamWritable
util.inherits(Container, Writable);

// Handles chunk of data. It will buffer it if line end not detected
Container.prototype.parse = function (data) {
    var chars = [
        {from: /\r\r/g, to: "\r[#SPLIT#][#RETURN#]"},
        {from: /\r\n/g, to: "[#SPLIT#]"},
        {from: /\n/g, to: "[#SPLIT#]"},
        {from: /\r/g, to: "\r[#RETURN#]"},
        {from: /\r\s/g, to: " "}
    ];

    var result = data.toString();
    _.each(chars, function (val, idx) {
        result = result.replace(val.from, val.to);
    });

    this.lineBuffer += result;

    if (/\[#SPLIT#\]/.test(result)) {
        var lines = [];
        var result = this.lineBuffer.split("[#SPLIT#]").filter(function (e) {
            return e
        });
        _.each(result, function (l) {
            lines = lines.concat(l.split("[#RETURN#]"));
        }, this);
        this.lineBuffer = "";
        return lines.filter(function (e) {
            return e != "\r" && e != ""
        });
    }

    return null;
};

// Handles chunk of data from pipe
// Note:it may call `this.callback` more than once
Container.prototype._write = function (chunk, enc, cb) {
    var lines = this.parse(chunk);
    if (this.callback && lines) {
        _.each(lines, function (l) {
            console.log("PARSE:",l);
            this.callback({
                id: this.id,
                line: this.lineNum++,
                data: l
            });
        }, this);
    }
    cb();
};


module.exports = Container;