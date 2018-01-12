FROM debian:jessie

LABEL maintainer="Linagora Folks <lgs-openpaas-dev@linagora.com>"
LABEL description="Provides an image with Janus Gateway"

RUN apt-get update -y \
    && apt-get upgrade -y

RUN apt-get install -y \
    libmicrohttpd-dev \
    libjansson-dev \
    libnice-dev \
    libssl-dev \
    libsofia-sip-ua-dev \
    libglib2.0-dev \
    libopus-dev \
    libogg-dev \
    libini-config-dev \
    libcollection-dev \
    pkg-config \
    gengetopt \
    libtool \
    autotools-dev \
    automake

RUN apt-get install -y \
    sudo \
    make \
    git \
    doxygen \
    graphviz \
    cmake

RUN cd ~ \
    && git clone https://github.com/cisco/libsrtp.git \
    && cd libsrtp \
    && git checkout v2.0.0 \
    && ./configure --prefix=/usr --enable-openssl \
    && make shared_library \
    && sudo make install

RUN cd ~ \
    && git clone https://github.com/sctplab/usrsctp \
    && cd usrsctp \
    && ./bootstrap \
    && ./configure --prefix=/usr \
    && make \
    && sudo make install

RUN cd ~ \
    && git clone https://github.com/warmcat/libwebsockets.git \
    && cd libwebsockets \
    && git checkout v2.1.0 \
    && mkdir build \
    && cd build \
    && cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr .. \
    && make \
    && sudo make install

RUN cd ~ \
    && git clone https://github.com/meetecho/janus-gateway.git \
    && cd janus-gateway \
    && sh autogen.sh \
    && ./configure --prefix=/opt/janus --disable-rabbitmq --disable-mqtt --enable-docs \
    && make CFLAGS='-std=c99' \
    && make install \
    && make configs

COPY conf/*.cfg /opt/janus/etc/janus/

RUN apt-get install nginx -y
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 7088 8088 8188

CMD service nginx restart && /opt/janus/bin/janus