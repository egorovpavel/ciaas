module.exports = function (sequelize, DataTypes) {
    var Build = sequelize.define('Build', {
        build_id: {
            type: DataTypes.INTEGER
        },
        log_build: {
            type: DataTypes.TEXT
        },
        log_result: {
            type: DataTypes.STRING
        },
        status_exec: {
            type: DataTypes.ENUM('QUEUED', 'RUNNING', 'COMPLETE')
        },
        status_result: {
            type: DataTypes.ENUM('SUCCESS', 'FAILED', 'TIMEOUT')
        },
        finished: {
            type: DataTypes.DATE
        },
        started: {
            type: DataTypes.DATE
        }
    }, {
        getterMethods: {
            log_build: function () {
                return JSON.parse(this.getDataValue('log_build'));
            }
        },
        instanceMethods: {
            elapsed: function () {
                var diff = this.finished.getTime() - this.started.getTime();
                return new Date(diff);
            }
        },
        classMethods: {
            associate: function (models) {
                Build.belongsTo(models.Project);
            }
        }
    });

    return Build;
};