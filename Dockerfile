FROM node:4.2

MAINTAINER Daniel Moll

WORKDIR /home/targets-io

#USER root

#RUN apt-get update && apt-get install -y --no-install-recommends python2.7


# Install targets-io Prerequisites
RUN npm install -g grunt-cli
RUN npm install -g bower
RUN npm install -g forever
RUN apt-get install g++

ENV PYTHON /usr/bin/python2.7

# Install targets-io packages
ADD package.json /home/targets-io/package.json
RUN npm install --production


# Manually trigger bower. Why doesnt this work via npm install?
ADD .bowerrc /home/targets-io/.bowerrc
ADD bower.json /home/targets-io/bower.json
RUN bower install --config.interactive=false --allow-root

#USER node

# Make everything available for start
ADD . /home/targets-io

#USER root

#RUN chown -R node:node /home/targets-io


# currently only works for development
ENV NODE_ENV demo


# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
#ENTRYPOINT forever -c 'node --harmony' server.js
#ENTRYPOINT MONGO_URL=mongodb://$MONGO_SERVICE_HOST:$MONGO_SERVICE_PORT  MEMCACHED_HOST=$MEMCACHED_SERVICE_HOST:$MEMCACHED_SERVICE_PORT GRAPHITE_HOST=http://$GRAPHITE_SERVICE_HOST:$GRAPHITE_SERVICE_PORT forever -c 'node --harmony' server.js

COPY docker-entrypoint-demo.sh /entrypoint.sh

#RUN chown -R node:node /entrypoint.sh

RUN chmod +x  /entrypoint.sh

#USER node

ENTRYPOINT ["/entrypoint.sh"]

