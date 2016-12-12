#!/usr/bin/env bash

set -e

if [ -z "$MONGO_URL" ]; then
			echo >&2 'error: Need to set MONGO_URL'

			exit 1
fi
if [ -z "$JENKINS_USER" ]; then
			echo >&2 'error: Need to set JENKINS_USER'

			exit 1
fi
if [ -z "$JENKINS_PASSWORD" ]; then
			echo >&2 'error: Need to set JENKINS_PASSWORD'

			exit 1
fi
if [ -z "$JENKINS_URL" ]; then
			echo >&2 'error: Need to set JENKINS_URL'

			exit 1
fi
if [ -z "$REDIS_HOST" ]; then
			echo >&2 'error: Need to set REDIS_HOST'

			exit 1
fi
if [ -z "$REDIS_PORT" ]; then
			echo >&2 'error: Need to set REDIS_PORT'

			exit 1
fi
if [ -z "$GRAPHITE_URL" ]; then
			echo >&2 'error: Need to set GRAPHITE_URL'

			exit 1
fi

bash -c "forever -c 'node --harmony' server.js"

