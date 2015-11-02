#!/usr/bin/env bash

set -e

[ -z "$MONGO_SERVICE_HOST" ] && echo "Need to set MONGO_SERVICE_HOST" && exit 1;
[ -z "$MONGO_SERVICE_PORT" ] && echo "Need to set MONGO_SERVICE_PORT" && exit 1;
[ -z "$MEMCACHED_SERVICE_HOST" ] && echo "Need to set MEMCACHED_SERVICE_HOST" && exit 1;
[ -z "$MEMCACHED_SERVICE_PORT" ] && echo "Need to set MEMCACHED_SERVICE_PORT" && exit 1;
[ -z "$GRAPHITE_SERVICE_HOST" ] && echo "Need to set GRAPHITE_SERVICE_HOST" && exit 1;
[ -z "$GRAPHITE_SERVICE_PORT" ] && echo "Need to set GRAPHITE_SERVICE_PORT" && exit 1;

exec "MONGO_URL=mongodb://$MONGO_SERVICE_HOST:$MONGO_SERVICE_PORT  MEMCACHED_HOST=$MEMCACHED_SERVICE_HOST:$MEMCACHED_SERVICE_PORT GRAPHITE_HOST=http://$GRAPHITE_SERVICE_HOST:$GRAPHITE_SERVICE_PORT forever -c 'node --harmony' server.js"
