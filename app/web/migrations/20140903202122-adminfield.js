var AccountModel = require("../models/Account");
module.exports = {
  up: function(migration, DataTypes, done) {
    var Account = AccountModel(migration.migrator.sequelize,DataTypes);
    migration.addColumn('Accounts','isAdmin',{type:DataTypes.BOOLEAN,defaultValue:false}).then(function(){
	    return Account.create({
        username : 'admin',
        email : 'admin@admin.com',
        password : '$2a$08$yImF5w4Niup67in5vRvg9.T5g.hcr.ZRx8SMa2oUN9R6zroAmTBDe',
        isAdmin : 1
      });
    }).then(function(){
      done();
    })
  },
  down: function(migration, DataTypes, done) {
    migration.removeColumn('Accounts', 'isAdmin').then(function(){
    	done()	
    })
  }
}
