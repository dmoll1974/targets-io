#!/bin/sh
kubectl create -f kubernetes/mongo-service.json
kubectl create -f kubernetes/mongo-controller.json
kubectl create -f kubernetes/memcached-service.json
kubectl create -f kubernetes/memcached-controller.json
kubectl create -f kubernetes/graphite-ui-service.json
kubectl create -f kubernetes/graphite-carbon-service.json
kubectl create -f kubernetes/graphite-controller.json
kubectl create -f kubernetes/targets-io-service.json
kubectl create -f kubernetes/targets-io-controller.json
kubectl create -f kubernetes/jenkins-service.json
kubectl create -f kubernetes/jenkins-controller.json
kubectl create -f kubernetes/dropwizard-service.json
kubectl create -f kubernetes/dropwizard-jmx-service.json
kubectl create -f kubernetes/dropwizard-controller.json
gcloud compute firewall-rules create targets-io-80 --allow=tcp:80
gcloud compute firewall-rules create graphite-2003 --allow=tcp:2003
gcloud compute firewall-rules create dropwizard-8090 --allow=tcp:8090
gcloud compute firewall-rules create jenkins-8080 --allow=tcp:8080








