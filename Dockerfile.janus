#
# Hubl.in Docker container configured for Janus
#
# Build
#    docker build -t linagora/hublin:janus -f Dockerfile.janus .
#
# Run server and expose 8080
#    docker run -p 8080:8080 linagora/hublin:janus
#
# Run in interactive mode (start the container and launch the bash shell)
#    docker run -i -t linagora/hublin:janus /bin/bash
#

FROM linagora/hublin:latest

RUN sed -i 's/easyrtc/janus/g' /src/config/default.json

CMD ["npm", "start"]
