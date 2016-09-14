#!/usr/bin/env bash

cd /usr/local/src
sudo git clone https://github.com/dmoll1974/targets-io.git
cd targets-io/
sudo ./init-graphite-container-volumes.sh
sudo docker-compose up -d
