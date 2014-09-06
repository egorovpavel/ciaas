#
# Cookbook Name:: container-nodejs
# Recipe:: default
#
# Copyright (C) 2014 
#
# 
#


execute "npm-install-nodeunit" do
    command "sudo npm install nodeunit -g"
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