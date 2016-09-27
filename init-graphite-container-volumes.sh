#!/bin/sh

set -e
set -x

LOG_DIR=/var/lib/targets-io/graphite/log
DATA_DIR=/var/lib/targets-io/graphite/storage

VOLUMES_INIT_CONTAINER_NAME=graphite-volumes-init


# this will fail if one of the volume directories already exists, this prevents you from accidentally deleting your existing data
mkdir /var/lib/targets-io
mkdir /var/lib/targets-io/graphite
mkdir $LOG_DIR
mkdir $DATA_DIR

#sudo restorecon -Rv /$HOME/graphite-volumes
#sudo chcon -Rt svirt_sandbox_file_t $LOG_DIR
#sudo chcon -Rt svirt_sandbox_file_t $DATA_DIR

docker rm -f $VOLUMES_INIT_CONTAINER_NAME || true

docker pull hopsoft/graphite-statsd

docker run -d \
  --name $VOLUMES_INIT_CONTAINER_NAME \
  hopsoft/graphite-statsd

sleep 2
docker logs $VOLUMES_INIT_CONTAINER_NAME

docker cp $VOLUMES_INIT_CONTAINER_NAME:/opt/graphite/storage $DATA_DIR
mv $DATA_DIR/storage/* $DATA_DIR
rmdir $DATA_DIR/storage

docker cp $VOLUMES_INIT_CONTAINER_NAME:/var/log $LOG_DIR
mv $LOG_DIR/log/* $LOG_DIR
rmdir $LOG_DIR/log

docker rm -f $VOLUMES_INIT_CONTAINER_NAME

echo "Removing .pid files"
rm $DATA_DIR/*.pid

echo "Content of storage directory"
ls -alFtr $DATA_DIR

echo "Content of log directory"
ls -alFtr $LOG_DIR

echo "Success"
