FROM node4-base-image

MAINTAINER Matthias Luebken, matthias@catalyst-zero.com

WORKDIR /home/mean

USER root

#RUN apt-get update && apt-get install -y --no-install-recommends python2.7


# Install Mean.JS Prerequisites
RUN npm install -g grunt-cli
RUN npm install -g bower
RUN npm install -g forever
RUN apt-get install g++

ENV PYTHON /usr/bin/python2.7

# Install Mean.JS packages
ADD package.json /home/mean/package.json
RUN npm install --production


# Manually trigger bower. Why doesnt this work via npm install?
ADD .bowerrc /home/mean/.bowerrc
ADD bower.json /home/mean/bower.json
RUN bower install --config.interactive=false --allow-root



# Make everything available for start
ADD . /home/mean

RUN chown -R node:node /home/mean

USER node

# currently only works for development
ENV NODE_ENV production


# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
ENTRYPOINT forever -c 'node --harmony' server.js
