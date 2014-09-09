#
# Cookbook Name:: aws-ciaas
# Recipe:: docker-images
#
# Copyright (C) 2014 
#
# 
#
log "message" do
  message "Exporting dokerimages"
  level :info
end
node['IMAGES'].each do |image|
	execute "export-nodejs-image" do
	    command 'sudo docker import '+image['URL']+' '+image['NAME']
	end
end
log "message" do
  message "Finishing exporting doker images"
  level :info
end
