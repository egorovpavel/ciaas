module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('Projects','default_branch',{type:DataTypes.STRING,defaultValue:"master"}).then(function(){
    	return migration.addColumn('Builds','branch',{type:DataTypes.STRING,defaultValue:"master"});
    }).then(function(){
    	return migration.addColumn('Builds','commit_id',{type:DataTypes.STRING});
    }).then(function(){
    	return migration.addColumn('Builds','commit_message',{type:DataTypes.STRING});
    }).then(function(){
    	return migration.addColumn('Builds','commit_author',{type:DataTypes.STRING});
    }).then(function(){
    	done()	
    });
  },
  down: function(migration, DataTypes, done) {
    migration.removeColumn('Projects', 'default_branch').then(function(){
    	return migration.removeColumn('Builds','branch');
    }).then(function(){
    	return migration.removeColumn('Builds','commit_id');
    }).then(function(){
    	return migration.removeColumn('Builds','commit_message');
    }).then(function(){
    	return migration.removeColumn('Builds','commit_author');
    }).then(function(){
    	done()	
    })
  }
}
