# Hubl.in

[https://hubl.in](Hubl.in) is a free and open source video conference solution built with love and designed with ethics in mind.
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

## License

[Affero GPL v3](http://www.gnu.org/licenses/agpl-3.0.html)
