# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.hostname = "docker-host"
  config.vm.network :forwarded_port, guest: 80, host: 3000
  config.vm.network :forwarded_port, guest: 8090, host: 8090 
  config.vm.network :forwarded_port, guest: 8070, host: 8080
  config.vm.provision :docker
  config.vm.provision :docker_compose
  config.vm.provision "shell", inline: <<-SHELL
    cd /usr/local/src
    sudo git clone https://github.com/dmoll1974/targets-io.git
    cd targets-io/
    sudo ./init-graphite-container-volumes.sh
    sudo docker-compose up -d
    SHELL
  config.vm.provider :virtualbox do |v|
    v.customize ["modifyvm", :id, "--memory", 3072]
  end  
end
