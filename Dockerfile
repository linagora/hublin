#
# Hubl.in Docker container
#
# Build
#    docker build -t linagora/hublin .
#
# Run server and expose 8080
#    docker run -p 8080:8080 linagora/hublin
#
# Run in interactive mode (start the container and launch the bash shell)
#    docker run -i -t linagora/hublin /bin/bash
#

FROM node:8

LABEL maintainer="Linagora Folks <lgs-openpaas-dev@linagora.com>"
LABEL description="Provides an image with Hublin"

# Cache NPM install of package.json has not been changed
# cf http://www.clock.co.uk/blog/a-guide-on-how-to-cache-npm-install-with-docker
ADD package.json /src/package.json

# Cache bower
ADD bower.json /src/bower.json
ADD .bowerrc /src/.bowerrc

RUN cd /src && npm install bower
RUN cd /src && npm install --production --unsafe-perm

ADD . /src

ADD config/db.json.docker /src/config/db.json

ENV REDIS_HOST redis
ENV REDIS_PORT 6379

EXPOSE 8080 8443

WORKDIR /src
CMD ["npm", "start"]
