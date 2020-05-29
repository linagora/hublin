# Deprecated

**!!! This project is deprecated and not maintained anymore !!!**

# Hubl.in

[![Join the chat at https://gitter.im/linagora/hublin](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/linagora/hublin?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Code Climate](https://codeclimate.com/github/linagora/hublin/badges/gpa.svg)](https://codeclimate.com/github/linagora/hublin)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/30d5ffabcf7e49a789fa6024a33d918e)](https://www.codacy.com/app/linagora/hublin?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=linagora/hublin&amp;utm_campaign=Badge_Grade)
[![CodeFactor](https://www.codefactor.io/repository/github/linagora/hublin/badge)](https://www.codefactor.io/repository/github/linagora/hublin)
[![Build Status](https://travis-ci.org/linagora/hublin.svg?branch=master)](https://travis-ci.org/linagora/hublin)
[![Docker Build Status](https://img.shields.io/docker/build/linagora/hublin.svg)](https://hub.docker.com/r/linagora/hublin)

[Hubl.in](https://hubl.in) is a free and open source video conference solution built with love and designed with ethics in mind.
It's the best way to initiate a communication anywhere with anybody and brings real time conversation to the next level.
Hubl.in allows free communication without additional plugins.

## Installation

A complete and more advanced documentation is available at [https://linagora.github.io/hublin-doc](https://linagora.github.io/hublin-doc). The following instructions assumes that you are installing Hublin on a debian distribution.

1. clone the repository

``` sh
git clone https://github.com/linagora/hublin.git
```

2. Install node.js

Hublin uses Node 8. It is highly recommended that you use [nvm](https://github.com/creationix/nvm) to install a specific version of node.

``` sh
nvm use
# will install and use required node version (lts/carbon)
```

3. Go into the project root directory and install project dependencies

``` sh
npm install
```

4. Install and configure MongoDB

You must install mongoDB. We suggest you to use mongoDB version 2.6.5.

``` sh
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/debian-sysvinit dist 10gen' | tee /etc/apt/sources.list.d/mongodb.list
apt-get install -y mongodb-org=2.6.5 mongodb-org-server=2.6.5 mongodb-org-shell=2.6.5 mongodb-org-mongos=2.6.5 mongodb-org-tools=2.6.5
service mongod start
```

5. Copy the sample `db.json` configuration file and adapt it to your needs (especially the mongodb URL)

``` sh
cp config/db.json.sample config/db.json
```

6. Install Redis

``` sh
apt-get install redis-server
```

A more advanced deployment using the Janus WebRTC Gateway is possible and described in the [Hublin + Janus documentation](https://linagora.github.io/hublin-doc/getting-started/janus/).

## Starting the server

Once all your services are ready and started (Mongo, Redis and optionally Janus), use `npm start` to start the server

``` sh
npm start
```

Hublin is now available on [http://localhost:8080](http://localhost:8080).

## Testing

First, install the required npm dependencies (as an administrator):

``` sh
npm install -g mocha grunt-cli bower karma-cli
```

You can check that everything works by launching the test suite:

``` sh
grunt
```

If you want to launch tests from a single test, you can specify the file as command line argument.
For example, you can launch the backend tests on the `test/unit-backend/webserver/index.js` file like this:

``` sh
grunt test-unit-backend --test=test/unit-backend/webserver/index.js
```

Note: This works for backend and midway tests.

Some specialized Grunt tasks are also available, check the `Gruntfile.js` file for more:

```
grunt linters # launch hinter and linter against the codebase
grunt test-frontend # only run the fontend unit tests
grunt test-unit-backend # only run the unit backend tests
grunt test-midway-backend # only run the midway backend tests
grunt test # launch all the testsuite
```
## Fixtures

Fixtures can be configured in the fixtures folder and injected in the system using `grunt`:

``` sh
grunt fixtures
```

Note that this will override all the current configuration resources with the fixtures ones.

## Develop

Running `grunt dev` will start the server in development mode. Whenever you
make changes to server files, the server will be restarted. Make sure you have
started the `mongodb` and `redis` services beforehand.

### Updating files for distribution

`grunt` plugins are used to process files and generate distribution.
You will have to follow some rules to not break the distribution generation which are defined here.

#### Frontend

Any project frontend JS file which is under `frontend/js` and used in a web page must be placed between generator tags.
For example, in `frontend/views/meetings/index.pug` file:

``` html
// <!--build:js({.tmp,frontend}) meetings.js-->
script(src='/js/modules/user/user.js')
...
script(src='/js/meetings/app.js')
// <!--endbuild-->
```

The files placed between the two comment lines will be used to generate a `meetings.js` file (concatenate and minify all).

### Backend

All the files from backend are copied into the `dist/backend` folder without any change.

### Static files

These folders are pushed in the distribution:

- `config`
- `templates`

If you need to add more, you will have to change the `copy:dist` and `dist-files` tasks in `Gruntfile.js`

## Create a distribution

To create a distribution with clean environment, minified files and install production dependencies:

``` sh
grunt dist-all
cd dist
npm install --production
```

Then you can start the server with `npm start`, `node server`, or your favorite tool (Kudos to forever).

## Docker

Hubl.in is available on the Docker Hub as `linagora/hublin`, so you can pull it from there:

``` sh
docker pull linagora/hublin
```

Or you can build it from the current git repository

```
docker build -t linagora/hublin .
```

The `linagora/hublin` container is configured to get the mongodb connection from `mongodb://mongo:27017` URL. You can modify the `config/db.json` file and adapt to use your own instance, or continue to use Docker and use one of the solutions below.

### docker-compose

`docker-compose` allows to describe and run distributed applications (cf `docker-compose.yml` file).

You can launch Hublin with compose from the current directory:

``` sh
DOCKER_IP=<YOUR DOCKER IP> docker-compose up
```

Where `DOCKER_IP` is the public IP address where Docker services can be reached. This will be used by Janus to send back the right IP to Web clients (ICE candidates) so that they can communicate with Janus correctly.

### Janus with docker

The docker image configured for Janus is available on the Hub as `linagora/hublin:janus`.

``` sh
docker pull linagora/hublin:janus
```

Or you can build it from the current repository

``` sh
docker build -t linagora/hublin:janus -f Dockerfile.janus .
```

You can launch Hublin with Janus and all required services with Docker compose like:

``` sh
DOCKER_IP=<YOUR DOCKER IP> docker-compose -f docker-compose.yml -f docker-compose.janus.yml up
```

If you want to launch required services except Hublin container to start it on your own for development purposes for example, you can do:

```sh
DOCKER_IP=<YOUR DOCKER IP> docker-compose -f docker-compose.yml -f docker-compose.janus.yml up janus-gateway mongo redis
```

And then start Hublin

```sh
NODE_ENV=dev npm start
```

## Embedding

Want to embed hubl.in on your website? Read more [here](doc/embedding.md).

## License

[Affero GPL v3](http://www.gnu.org/licenses/agpl-3.0.html)
