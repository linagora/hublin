# Hubl.in! installation guide with Janus

## Installation

1. Clone the janus branch on the repository, which contains the hubl.in! adaptation for Janus

        git clone --recursive janus https://ci.open-paas.org/stash/scm/meet/meetings.git

2. Install and configure MongoDB

  You must install mongoDB. We suggest you use mongoDB version 2.6.5.

  1. First import the repository key
        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10

  2. Add the repository to your apt configuration
        echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list

  3. Install MongoDB 2.6.5
        sudo apt-get update
        apt-get install -y mongodb-org=2.6.5 mongodb-org-server=2.6.5 mongodb-org-shell=2.6.5 mongodb-org-mongos=2.6.5 mongodb-org-tools=2.6.5

  4. Run MongoDB
        service mongod start

3. Install node.js

  We are currently using Node 6. It is highly recommended that you use [nvm](https://github.com/creationix/nvm) to install a specific version of node, using the following line:

      nvm install 6

4. Install Redis

        apt-get install redis-server

5. Go to the project directory and copy the sample db.json configuration file and adapt it to your need (especially the mongodb URL if you do not use default parameters from step 2)

        cp config/db.json.sample config/db.json

6. Install the npm dependencies (as an administrator)

        npm install -g mocha grunt-cli bower karma-cli

7. Go into the modules directory and install easyrtc connector module dependecies

        cd modules/hublin-easyrtc-connector
        npm install

8. Go into the project directory and install project dependencies

        cd meetings
        npm install
