# CIaaS (final project  @ ISEL DEETC)

## Development Environment

### Requirements

- Git (http://git-scm.com/)
- Virtual Box (https://www.virtualbox.org/wiki/Downloads) 
- Vagrant (https://www.vagrantup.com/downloads.html)
- Chef Development Kit (http://downloads.getchef.com/chef-dk)

### Getting started

#### Check requirements

First make sure you have installed all requirements. Open console and type:

Git:

	$ git --version
    git version 1.9.4.msysgit.0

Vagrant:

    $ vagrant -v
    Vagrant 1.6.3

ChefDK & Berkshelf

    $ berks -v
    3.1.3

Now install vagrant plugin for berkshelf and  ominibus support:

    $ vagrant plugin install vagrant-berkshelf --plugin-version 2.0.1
    Installing the 'vagrant-berkshelf' plugin. This can take a few minutes...
    Installed the plugin 'vagrant-berkshelf (2.0.1)!'

    $ vagrant plugin install vagrant-omnibus
    Installing the 'vagrant-omnibus' plugin. This can take a few minutes...
    Installed the plugin 'vagrant-omnibus (1.4.1)'!

Next install cookbook recipes using berkshelf. Inside /cookbooks/ciaas open console and type

    $ berks install


#### Start and provision VM

In project folder open console (windows: with Administrator role) and type:

    $ vagrant up
    Bringing machine 'default' up with 'virtualbox' provider...
    ==> default: Importing base box 'phusion/ubuntu-14.04-amd64'
    ==> default: Matching MAC address for NAT networking...
    ==> default: Checking if box 'phusion/ubuntu-14.04-amd64' is
    ==> default: Setting the name of the VM: facts_default_14090
    ==> default: Clearing any previously set forwarded ports...
    ....
    .... very verbose output of vagrant and provisioning
    ....
    ==> default: [2014-08-26T21:14:18+00:00] INFO: Chef Run complete in 232.626688803 seconds
    ==> default: [2014-08-26T21:14:18+00:00] INFO: Running report handlers
    ==> default: [2014-08-26T21:14:18+00:00] INFO: Report handlers complete

This command will download box file (~300Mb) start adn provision headless VM with mapping root of project of host OS into `/vagrant` folder of guest OS. Also it will forward ports for mysql(3306), redis(6379) and http(8080) into host OS.

