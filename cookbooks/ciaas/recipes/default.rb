#
# Cookbook Name:: ciaas
# Recipe:: default
#
# Copyright (C) 2014 
#
# 
#
include_recipe "mysql::server"
include_recipe "database::mysql"

mysql_database 'ci' do
  connection(
    :host     => 'localhost',
    :username => 'root',
    :password => node['mysql']['server_root_password']
  )
  action :create
end

mysql_database_user 'root' do
  connection(
    :host     => 'localhost',
    :username => 'root',
    :password => node['mysql']['server_root_password']
  )
  host '%'
  password 'root'
  action :grant
end

execute "install_mocha" do
    command "sudo npm install -g mocha"
end

execute "install_grunt-cli" do
    command "sudo npm install -g grunt-cli"
end

execute "npm-install-bower" do
    command "sudo npm install -g bower"
end

execute "npm-install-worker" do
	cwd '/vagrant/app/worker'
    command "sudo npm install"
end

execute "npm-install-web" do
	cwd '/vagrant/app/web'
    command "sudo npm install"
end

execute "npm-install-hub" do
	cwd '/vagrant/app/hub'
    command "sudo npm install"
end

execute "bower-fix" do
    command 'git config --global url."https://".insteadOf git://'
end

execute "bower-intsall" do
	cwd '/vagrant/app/web'
    command 'bower install --allow-root'
end

execute "grunt-template-compile" do
	cwd '/vagrant/app/web'
    command 'grunt less:development'
end

execute "npm-migrateUp" do
	cwd '/vagrant/app/web'
    command 'npm run-script migrateUp'
end