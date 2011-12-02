#!/usr/bin/env node

var fs = require('fs');

var mongo = require('mongoskin');
var async = require('async');

var minify = require('../lib/ext/minify.json').minify;
var keymaster = require('../lib/keymaster');


var config = JSON.parse(minify(fs.readFileSync(process.argv[2]).toString()));

var db = mongo.db(config.db.host + ':' + config.db.port + '/' +
                  config.db.db);

keymaster.importKeysEnv();

var sources = config.sources_static;

async.forEachSeries(sources,
                    function(item, callback) {
                      console.log(item);
                      require("../lib/"+item)(db, callback);
                    }, function(error) {
                      if (error) {
                        console.log(error);
                        process.exit(-1);
                      } else {
                        process.exit(0);
                      }
                    });