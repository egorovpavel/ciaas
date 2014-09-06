'use strict'
var AuthorizationMixin = {
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