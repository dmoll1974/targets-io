# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.hostname = "docker-host"
  config.vm.network :forwarded_port, guest: 3000, host: 3000
  config.vm.network :forwarded_port, guest: 8090, host: 8090 
  config.vm.network :forwarded_port, guest: 8070, host: 8070
  config.vm.provision :docker
  config.vm.provision :docker_compose
  config.vm.provision :shell, path: "bootstrap.sh"
  config.vm.provider :virtualbox do |v|
    v.customize ["modifyvm", :id, "--memory", 3072]
  end

end