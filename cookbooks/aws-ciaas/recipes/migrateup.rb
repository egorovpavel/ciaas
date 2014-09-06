#
# Cookbook Name:: aws-ciaas
# Recipe:: migrateup
#
# Copyright (C) 2014 
#
# 
#
execute "npm-migrateUp" do
	cwd '/srv/www/ciaas_web'
    command 'npm run-script migrateUp'
end