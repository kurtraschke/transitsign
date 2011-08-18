#!/usr/bin/env node

var fs = require('fs');
var minify = require('../lib/ext/minify.json').minify;

var transitsign = require('../lib/server');

var config = JSON.parse(minify(fs.readFileSync(process.argv[2]).toString()));

transitsign.run(config)