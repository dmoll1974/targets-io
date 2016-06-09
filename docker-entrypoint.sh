#!/usr/bin/env bash

set -e

if [ -z "$MONGO_URL" ]; then
			echo >&2 'error: Need to set MONGO_URL'

			exit 1
fi
if [ -z "$MONGO_USER" ]; then
			echo >&2 'error: Need to set MONGO_USER'

			exit 1
fi
if [ -z "$MONGO_PASSWORD" ]; then
			echo >&2 'error: Need to set MONGO_PASSWORD'

			exit 1
fi
if [ -z "$REDIS_SERVICE_HOST" ]; then
			echo >&2 'error: Need to set REDIS_SERVICE_HOST'

			exit 1
fi
if [ -z "$REDIS_SERVICE_PORT" ]; then
			echo >&2 'error: Need to set REDIS_SERVICE_PORT'

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

GRAPHITE_HOST=http://$GRAPHITE_SERVICE_HOST:$GRAPHITE_SERVICE_PORT  bash -c "forever -c 'node --harmony' server.js"

