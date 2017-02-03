#!/bin/bash

ip="$1"

# adding external IP env variables for docker-compose
export EXTERNAL_IP=$ip

# start mongo container first
docker-compose up -d mongo

# wait a while for mongo to start
sleep 10

# start the rest of the containers
docker-compose up -d
