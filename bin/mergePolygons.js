#!/usr/bin/env node
"use strict";
var path = require('path');
var fs = require('fs');
var jsonfile = require('jsonfile');
var argv = require('minimist')(process.argv.slice(2));
var turfMerge = require('turf').merge;
var defined = require('../lib/defined');
var defaultValue = require('../lib/defaultValue');

if (process.argv.length < 3) {
    console.log('Usage: ./bin/roadHouse.js [INPUT] [OPTIONS]\n');
    console.log('  -i, --input=FILE   Input Geojson File');
    console.log('  -o, --output=FILE  Output Geojson File');
    console.log('  -p, --property     Property to use to group polygons together');
    console.log('');
    console.log('Only [INPUT]/-i/--input is required.');
    console.log('');

    process.exit(0);
}

var inputFile = defaultValue(argv._[0], defaultValue(argv.i, argv.input));
var outputFile = defaultValue(argv.o, defaultValue(argv.output, path.basename(inputFile, '.json') + '-out.json'));
var property = defaultValue(argv.p, defaultValue(argv.property, undefined));

var json = require(inputFile);

if (defined(json) && defined(json.features)) {
    var groupedFeatures = {};
    if (defined(property)) {
        var crs = json.crs;
        var type = json.type;
        var features = json.features;
        features.forEach(function(feature) {
            var value = feature.properties[property];
            var group = groupedFeatures[value];
            if (!defined(group))
            {
                group = {
                    crs: crs,
                    type: type,
                    features: []
                };
                groupedFeatures[value] = group;
            }

            group.features.push(feature);
        });
    }
    else {
        groupedFeatures._ = json;
    }

    var newFeatures = [];
    var newJson = {
        crs: crs,
        type: type,
        features: newFeatures
    };

    for (var name in groupedFeatures) {
        if (groupedFeatures.hasOwnProperty(name)) {
            newFeatures.push(turfMerge(groupedFeatures[name]));
        }
    }
    jsonfile.writeFile(outputFile, newJson, function (err) {
        console.error(err)
    });
}