var crypto = require('crypto');
module.exports = function (sequelize, DataTypes) {
    var Profile = sequelize.define('Profile', {
        type: DataTypes.ENUM('local', 'gihub'),
        token: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Token  cant be empty"
                }
            }
        }
    }, {
        paranoid: true,
        timestamps: true,
        classMethods: {
            associate: function (models) {
                Profile.hasOne(models.Account);
            }
        }
    });

    return Profile;
};