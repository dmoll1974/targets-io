#!/usr/bin/env bash

set -e

if [ -z "$MONGO_SERVICE_HOST" ]; then
			echo >&2 'error: Need to set MONGO_SERVICE_HOST'

			exit 1
fi
if [ -z "$MONGO_SERVICE_PORT" ]; then
			echo >&2 'error: Need to set MONGO_SERVICE_PORT'

			exit 1
fi
if [ -z "$MONGO_CACHE_SERVICE_HOST" ]; then
                        echo >&2 'error: Need to set MONGO_CACHE_SERVICE_HOST'

                        exit 1
fi
if [ -z "$MONGO_CACHE_SERVICE_PORT" ]; then
                        echo >&2 'error: Need to set MONGO_CACHE_SERVICE_PORT'

                        exit 1
fi

if [ -z "$MEMCACHED_SERVICE_HOST" ]; then
			echo >&2 'error: Need to set MEMCACHED_SERVICE_HOST'

			exit 1
fi
if [ -z "$MEMCACHED_SERVICE_PORT" ]; then
			echo >&2 'error: Need to set MEMCACHED_SERVICE_PORT'

			exit 1
fi
if [ -z "$GRAPHITE_SERVICE_HOST" ]; then
			echo >&2 'error: Need to set GRAPHITE_SERVICE_HOST'

			exit 1
fi
if [ -z "$GRAPHITE_SERVICE_PORT" ]; then
			echo >&2 'error: Need to set GRAPHITE_SERVICE_PORT'

			exit 1
fi

MONGO_URL=mongodb://$MONGO_SERVICE_HOST:$MONGO_SERVICE_PORT MONGO_CACHE_URL=mongodb://$MONGO_CACHE_SERVICE_HOST:$MONGO_CACHE_SERVICE_PORT  GRAPHITE_HOST=http://$GRAPHITE_SERVICE_HOST:$GRAPHITE_SERVICE_PORT  bash -c "forever -c 'node --harmony' server.js"

