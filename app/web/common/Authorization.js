'use strict'
var AuthorizationMixin = {
	isGuest : function(req,res,done){
		if(!req.user){
			done();
		}else{
			res.redirect('/projects');
		}
	},
	isAuthenticated : function(req,res,done){
		if(req.user){
			done();
		}else{
			res.redirect('/login');
		}
	},
	isAdmin : function(req,res,done){
		if(req.user.admin){
			done();
		}else{
			res.redirect('/login');
		}
	}
};

module.exports = AuthorizationMixin;