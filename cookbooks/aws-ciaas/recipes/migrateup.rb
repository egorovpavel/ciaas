#
# Cookbook Name:: aws-ciaas
# Recipe:: migrateup
#
# Copyright (C) 2014 
#
# 
#
log "message" do
  message "Executing migrateup"
  level :info
end
execute "npm-migrateUp" do
	cwd '/srv/www/ciaas_web/current'
    command 'npm run-script migrateUp'
end
log "message" do
  message "Finishing executing migrateup"
  level :info
end
