function ConfigRepo(models){

    var createAccount = function(object_account){
        return models.Account.create(object_account);
    };

    var createProj = function(account, project){
        return account.createProject(project);
    };

    var associateToAccount = function(project,accountId){
        return models.Project.create(object_project);
    };

    var createProjectContainers = function(object_proj_containers){

        return models.Project_Container.create(object_proj_containers);
    };


    var getCommand = function(){  };

    var getArtifactPath = function(){  };

    var getAccountById = function(id){
        return  models.Account.find({where: {id : id}});
    };
    var getAccountByName = function(name){
        var acc =  models.Account.find({where: {name : name}});
        console.log(acc);
        return acc
    };
    var getProjectContainers = function(project_id){
        return 1
    };

    var getContainerByName = function(container_name){
        //var cont =  models.ContainerProject.find({where: {name : container_name}});
        //console.log(cont);
        //return cont
    };
    return {
        createProj: createProj,
        getCommand: getCommand,
        getArtifactPath: getArtifactPath,
        createAccount: createAccount,
        getAccountByName: getAccountByName,
        getAccountById: getAccountById,
        getProjectContainers: getProjectContainers,
        createProjectContainers: createProjectContainers,
        getContainerByName: getContainerByName
    }
};

module.exports = ConfigRepo;