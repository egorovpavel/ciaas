module.exports = function (sequelize, DataTypes) {
    var Container = sequelize.define('Container', {
        name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Name cant be empty"
                },
                is: {
                    args: ["^[a-z \-_0-9\\.]+$", 'i'],
                    msg: "Full name must be alpha"
                }
            },
            unique: true
        },
        type: {
            type: DataTypes.ENUM('primary', 'secondary'),
            validate: {
                notEmpty: {
                    msg: "Type must be primary or secondary"
                }
            }
        },
        description: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Description cant be empty"
                }
            }
        }
    }, {
        classMethods: {
            associate: function (models) {
                Container.hasMany(models.Project);
            }
        }
    });

    return Container;
};