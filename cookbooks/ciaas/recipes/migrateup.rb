#
# Cookbook Name:: ciaas
# Recipe:: default
#
# Copyright (C) 2014 
#
# 
#
execute "npm-migrateUp" do
	cwd '/vagrant/app/web'
    command 'npm run-script migrateUp'
end