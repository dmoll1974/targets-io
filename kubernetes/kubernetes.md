Setup kubernetes cluster on Google Container Engine (GCE)

Set zone for GCE

    export KUBE_GCE_ZONE=europe-west1-d
    
Run kube-up.sh

    cd ~/kubernetes
    clusters/kube-up.sh

Build docker container

    docker build -t gcr.io/targets-io-docker/targets-io .

Push container to GCE container repository

    gcloud docker push gcr.io/targets-io-docker/targets-io

Start MongoDb service

    kubectl create -f kubernetes/mongo-service.json

Start MongoDb controller

    kubectl create -f kubernetes/mongo-controller.json

Start Memcached service

    kubectl create -f kubernetes/memcached-service.json


Start Memcached controller

    kubectl create -f kubernetes/memcached-controller.json

Start Graphite frontend service

    kubectl create -f kubernetes/graphite-ui-service.json

Start Graphite carbon service

    kubectl create -f kubernetes/graphite-carbon-service.json

Start Graphite controller

    kubectl create -f kubernetes/graphite-controller.json

Start Targets-io service

    kubectl create -f kubernetes/targets-io-service.json

Start Targets-io controller

    kubectl create -f kubernetes/targets-io-controller.json

Open firewall for Targetsio port 3000

    gcloud compute firewall-rules create targetsio-3000 --allow=tcp:3000

Open firewall for Graphite port 80

    gcloud compute firewall-rules create graphite-80 --allow=tcp:80

Open firewall for port 3000

    kubectl create -f kubernetes/targets-io-controller.json
