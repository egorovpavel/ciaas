#
# Cookbook Name:: ciaas
# Recipe:: default
#
# Copyright (C) 2014 
#
# 
#

execute "install_mocha" do
    command "sudo npm install -g mocha"
end

execute "install_grunt-cli" do
    command "sudo npm install -g grunt-cli"
end