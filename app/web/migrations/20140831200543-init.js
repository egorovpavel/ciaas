module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Accounts",{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		email: {
			type: DataTypes.STRING,
			unique : true
		},
		username: {
			type: DataTypes.STRING,
			allowNull : false
		},
		password: {
			type: DataTypes.STRING,
		},
		token: {
			type: DataTypes.STRING,
		},
		createdAt: {
			type: DataTypes.DATE
		},
		updatedAt: {
			type: DataTypes.DATE
		},
		deletedAt: {
			type: DataTypes.DATE
		}
    }).then(function(){
    	return migration.createTable("Builds",{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			build_id: {
				type: DataTypes.INTEGER
			},	
			log_build : {
				type : DataTypes.TEXT
			},
			log_result : {
				type : DataTypes.STRING
			},
			status_exec : {
				type : DataTypes.ENUM,
				values : ['QUEUED','RUNNING','COMPLETE']
			},
			status_result : {
				type : DataTypes.ENUM,
				values : ['SUCCESS','FAILED','TIMEOUT']
			},
			finished: {
				type: DataTypes.DATE
			},
			started: {
				type: DataTypes.DATE
			},
			ProjectId: {
				type: DataTypes.INTEGER
			},
			createdAt: {
				type: DataTypes.DATE
			},
			updatedAt: {
				type: DataTypes.DATE
			}
    	});
    }).then(function(){
    	return migration.createTable("Projects",{
    		id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			name : {
				type : DataTypes.STRING
			},
			repo_url : {
				type : DataTypes.STRING
			},
			command : {
				type : DataTypes.STRING
			},
			artifact_path : {
				type : DataTypes.STRING
			},
			AccountId: {
				type: DataTypes.INTEGER
			},
			ContainerId: {
				type: DataTypes.INTEGER
			},
			createdAt: {
				type: DataTypes.DATE
			},
			updatedAt: {
				type: DataTypes.DATE
			}
    	})
    }).then(function(){
    	return migration.createTable("Containers",{
    		id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			name : {
				type : DataTypes.STRING
			},
			type : {
				type : DataTypes.ENUM,
				values : ['primary','secondary']
			},
			description : {
				type : DataTypes.STRING
			},
			createdAt: {
				type: DataTypes.DATE
			},
			updatedAt: {
				type: DataTypes.DATE
			}
    	})
    }).finally(function(){
    	done()	
    });
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('Containers')
    .then(function(){
    	return migration.dropTable('Builds');
    }).then(function(){
    	return migration.dropTable('Projects');
    }).then(function(){
    	return migration.dropTable('Accounts');
    }).finally(function(){
    	done();
    });
  }
}
