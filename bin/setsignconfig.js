#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var async = require('async');
var mongo = require('mongoskin');

var minify = require('../lib/ext/minify.json').minify;

var argv = require('optimist')
    .default('config', 'server-config.json')
    .describe('config', 'transitsign server configuration file')
    .default('sourcedir', 'directory for sign configuration documents')
    .default('sourcedir', 'signs')
    .describe('sign', 'name of sign to load')
    .string('sign')
    .boolean('all')
    .describe('all', 'load all signs')
    .check(function(args) {
        if (!(args.all ^ (typeof args.sign == 'string'))) {
            throw "Sign name or --all must be specified.";
        }
    })
    .argv;

var serverConfig = JSON.parse(minify(
                                fs.readFileSync(argv.config).toString()
                              ));

var db = mongo.db(serverConfig.db.host + ':' + serverConfig.db.port + '/' +
                  serverConfig.db.db);

var collection = db.collection('sign_configs');


if (argv.all) {
    async.forEachSeries(fs.readdirSync(argv.sourcedir),
                        loadSign,
                        callback);
} else {
    loadSign(argv.sign + '.json', callback);
}

function callback(error) {
    if (error) {
        console.error(error);
        process.exit(1);
    } else {
        process.exit(0);
    }
}

function loadSign(file, callback) {
    var signName = path.basename(file, '.json')

    var signFile = path.join(argv.sourcedir, file)

    try {
        var signConfig = JSON.parse(minify(
            fs.readFileSync(signFile).toString()
        ));
    } catch (error) {
        callback([file, error]);
        return;
    }
    collection.update({'sign_name': signName},
                      {'sign_name': signName,
                       'config': signConfig},
                      {'upsert': true},
                      function(err) {
                          if (err) {
                              callback(err);
                          } else {
                              console.log("Updated configuration for sign " + signName + ".");
                              callback(null);
                          }
                      });
}