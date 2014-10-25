module.exports = function (sequelize, DataTypes) {
    var Project = sequelize.define('Project', {
        name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Name cant be empty"
                },
                is: {
                    args: ["^[a-z \\-_0-9\\.]+$", 'i'],
                    msg: "Name must be alpha numeric"
                }
            }
        },
        repo_url: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Reposity cant be empty"
                }
            },
            unique: true
        },
        command: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Command cant be empty"
                }
            }
        },
        artifact_path: DataTypes.STRING,
        default_branch: DataTypes.STRING
    }, {
        instanceMethods: {
            lastBuildStatus : function(){
                return this.builds.length > 0 ? this.builds[this.builds.length -1].status_result : null;
            },
            lastBuildId : function(){
                return this.builds.length > 0 ? this.builds[this.builds.length -1].build_id : null;
            },
            isInProgress : function(){
                return this.builds.length > 0 ? this.builds[this.builds.length -1].status_result == null : null;
            }
        },
        classMethods: {
            associate: function (models) {
                Project.belongsTo(models.Account);
                Project.hasMany(models.Build);
                Project.belongsTo(models.Container);
                Project.hasMany(models.Container,{
                    as : "SecondaryContainer",
                    foreignKey: 'ProjectId',
                    through: "ProjectsSecondaryContainers"
                });
            }
        }
    });

    return Project;
};