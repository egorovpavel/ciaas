#
# Cookbook Name:: ciaas
# Recipe:: migrateup
#
# Copyright (C) 2014 
#
# 
#
execute "npm-migrateUp" do
	cwd '/vagrant/app/web'
    command 'npm run-script migrateUp'
end