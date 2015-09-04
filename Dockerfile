FROM node:0.12.0

MAINTAINER Matthias Luebken, matthias@catalyst-zero.com

WORKDIR /home/mean

# Install Mean.JS Prerequisites
RUN npm install -g grunt-cli
RUN npm install -g bower
RUN npm install -g forever

# Install Mean.JS packages
ADD package.json /home/mean/package.json
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?
ADD .bowerrc /home/mean/.bowerrc
ADD bower.json /home/mean/bower.json
RUN bower install --config.interactive=false --allow-root

# Make everything available for start
ADD . /home/mean

# currently only works for development
ENV NODE_ENV cloud

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
ENTRYPOINT MONGO_URL=mongodb://$MONGO_SERVICE_HOST:$MONGO_SERVICE_PORT  MEMCACHED_HOST=$MEMCACHED_SERVICE_HOST:$MEMCACHED_SERVICE_PORT GRAPHITE_HOST=http://$GRAPHITE_SERVICE_HOST:$GRAPHITE_SERVICE_PORT forever -c 'node --harmony' server.js
