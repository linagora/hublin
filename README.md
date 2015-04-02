# Hubl.in

[![Code Climate](https://codeclimate.com/github/linagora/hublin/badges/gpa.svg)](https://codeclimate.com/github/linagora/hublin)
[![Build Status](https://travis-ci.org/linagora/hublin.svg?branch=master)](https://travis-ci.org/linagora/hublin)

[Hubl.in](https://hubl.in) is a free and open source video conference solution built with love and designed with ethics in mind.
It's the best way to initiate a communication anywhere with anybody and brings real time conversation to the next level.
Hubl.in allows free communication without additional plugins.

## Installation

1. clone the repository

        git clone https://ci.open-paas.org/stash/scm/meet/meetings.git

2. install node.js

3. install the npm dependencies

        npm install -g mocha grunt-cli bower karma-cli

4. Go into the project directory and install project dependencies

        cd meetings
        npm install

## Testing

You can check that everything works by launching the test suite:

    grunt

If you want to launch tests from a single test, you can specify the file as command line argument.
For example, you can launch the backend tests on the test/unit-backend/webserver/index.js file like this:

    grunt test-unit-backend --test=test/unit-backend/webserver/index.js

Note: This works for backend and midway tests.

Some specialized Grunt tasks are available :

    grunt linters # launch hinter and linter against the codebase
    grunt test-frontend # only run the fontend unit tests
    grunt test-unit-backend # only run the unit backend tests
    grunt test-midway-bakend # only run the midway backend tests
    grunt test # launch all the testsuite

## Fixtures

Fixtures can be configured in the fixtures folder and injected in the system using grunt:

    grunt fixtures

Note that this will override all the current configuration resources with the fixtures ones.

## Starting the server

Use npm start to start the server !

    npm start


## Develop into Hubl.in

Running `grunt dev` will start the server in development mode. Whenever you
make changes to server files, the server will be restarted. Make sure you have
started the mongodb and redis servers beforehand.

In addition, you can run `grunt debug` to start the node-inspector debugger
server. Visit the displayed URL in Chrome or Opera to start the graphical
debugging session. Note that startup takes a while, you must wait until the Hubl.in
webserver starts to do anything meaningful.

### Updating files for distribution

grunt plugins are used to process files and generate distribution.
You will have to follow some rules to not break the distribution generation which are defined here.

#### Frontend

Any project frontend file which is under frontend/js and used in a web page must be placed between generator tags.
For example, in frontend/views/meetings/index.jade:

    // <!--build:js({.tmp,frontend}) meetings.js-->
    script(src='/js/modules/user/user.js')
    ...
    script(src='/js/meetings/app.js')
    // <!--endbuild-->

The files placed between the two comment lines will be used to generate a meetings.js file (concatenate and minify all).

### Backend

All the files from backend are copied into the dist/backend folder without any change.

### Static files

These folders are pushed in the distribution:

- config
- templates

If you need to add more, you will have to change the 'copy:dist' and 'dist-files' tasks in Gruntfile.js

## Create a distribution

To create a distribution with clean environment, minified files and install production dependencies:

    grunt dist-all
    cd dist
    npm install --production

Then you can start the server with 'npm start', 'node server', or your favorite tool (Kudos to forever).

## Docker

Hubl.in is available on the Docker Hub as linagora/hublin, so you can pull it from there:

    docker pull linagora/hublin

Or you can build it from the current git repository

    docker build -t linagora/hublin .

The linagora/hublin container is configured to get the mongodb connection from mongodb://db:27017 URL. You can modify the config/db.json file and adapt to use your own instance, or continue to use Docker and use one of the solutions below.

### docker-compose

docker-compose allows to describe and run distributed applications (cf docker-compose.yml file).

Note: A docker-compose based image is available on the Docker Hub at linagora/hublin-all.

#### Launch

    docker-compose up

#### Build

    docker-compose build

### docker containers

You can pull all the required containers by hand (mongodb, redis), start them, and create the links when starting Hubl.in:

    # get mongo and start it as a container named 'db'
    docker pull mongo
    docker run -d --name db mongo

    docker pull redis
    docker run -d --name redis redis

    # start hubl.in
    docker run -p 8080:8080 --link db:db --link redis:redis linagora/hublin

Once started, Hubl.in is available on http://<DOCKER_HOST>:8080.

Note: If you are on OS X and/or use boot2docker, DOCKER_HOST value will be the result of the 'boot2docker ip' call.

## Embedding

Want to embed hubl.in on your website? Read more [here](doc/embedding.md).

## License

[Affero GPL v3](http://www.gnu.org/licenses/agpl-3.0.html)
