'use strict';
var db = require('../models');
var Promise = require('bluebird');

var BuildsRepo = function () {

    var openBuild = function (project) {
        return db.Build.count({ where: ["ProjectId = ?", project.id] }).then(function (n) {
            var nextId = n + 1;
            var buildProperties = {
                status_exec: "QUEUED",
                build_id: nextId
            };
            return db.Build.create(buildProperties);
        }).then(function (build) {
            return build.setProject(project);
        });
    };

    var closeBuild = function (id, buildProperties) {
        return getById(id).then(function (build) {
            var promise = Promise.pending();
            build.log_build = buildProperties.name;
            build.log_result = buildProperties.type;
            build.status_exec = buildProperties.description;
            build.status_result = buildProperties.description;
            build.finished = buildProperties.description;
            build.started = buildProperties.description;
            var errors = build.validate();
            if (errors) {
                promise.reject(errors);
                return promise.promise;
            }
            return build.save();
        });
    };

    var getAll = function (project) {
        return project.getBuilds({
            order: 'build_id DESC'
        });
    };

    var getById = function (project, id) {
        return db.Build.find({where: {
            ProjectId: project.id,
            build_id: id
        }});
    };

    return {
        open: openBuild,
        close: closeBuild,
        all: getAll,
        get: getById
    }
}();

module.exports = BuildsRepo;