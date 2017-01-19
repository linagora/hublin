#
# Hubl.in Docker container
#
# Build
#    docker build -t openpaas/hublin .
#
# Run server and expose 8080
#    docker run -p 8080:8080 openpaas/hublin
#
# Run in interactive mode (start the container and launch the bash shell)
#    docker run -i -t openpaas/hublin /bin/bash
#

FROM node:6

MAINTAINER Linagora Folks <hublin@linagora.com>

# Cache NPM install of package.json has not been changed
# cf http://www.clock.co.uk/blog/a-guide-on-how-to-cache-npm-install-with-docker
ADD package.json /src/package.json

# Cache bower
ADD bower.json /src/bower.json
ADD .bowerrc /src/.bowerrc

RUN cd /src && npm install bower
RUN cd /src && npm install --production --unsafe-perm

ADD . /src

RUN cd /src/modules/hublin-easyrtc-connector && npm install --production

ADD config/db.json.docker /src/config/db.json

ENV HUBLIN_REDIS_HOST redis
ENV HUBLIN_REDIS_PORT 6379

EXPOSE  8080

WORKDIR /src
CMD ["npm", "start"]
