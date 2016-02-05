#!/usr/bin/env node
"use strict";
var path = require('path');
var fs = require('fs');
var jsonfile = require('jsonfile');
var argv = require('minimist')(process.argv.slice(2));
var turfMerge = require('turf').merge;
var defined = require('../lib/defined');
var defaultValue = require('../lib/defaultValue');

var inputFile = defaultValue(argv._[0], defaultValue(argv.i, argv.input));
if (!defined(inputFile) || defined(argv.h) || defined(argv.help)) {
    console.log('Usage: ./bin/roadHouse.js [INPUT] [OPTIONS]\n');
    console.log('  -h, --help         Show this help');
    console.log('  -i, --input        Input Geojson File');
    console.log('  -o, --output       Output Geojson File');
    console.log('  -p, --property     Property to use to group polygons together');
    console.log('');
    console.log('Only [INPUT]/-i/--input is required.');
    console.log('');

    process.exit(0);
}

var outputFile = defaultValue(argv.o, defaultValue(argv.output, path.join(path.dirname(inputFile), path.basename(inputFile, '.json') + '-out.json')));
var property = defaultValue(argv.p, defaultValue(argv.property, undefined));

var json = require(inputFile);

if (defined(json) && defined(json.features)) {
    var groupedFeatures = {};
    if (defined(property)) {
        var groupTimerName = 'Calculating groups using property \'' + property + '\'';
        console.time(groupTimerName);
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
        console.timeEnd(groupTimerName);
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

    console.log(Object.keys(groupedFeatures).length + ' groups found.');
    for (var name in groupedFeatures) {
        if (groupedFeatures.hasOwnProperty(name)) {
            var group = groupedFeatures[name];
            var timerName = 'Processing group ' + name;
            console.time(timerName);
            var merged = turfMerge(group);
            newFeatures.push(merged);
            console.timeEnd(timerName);
            console.log(group.features.length + ' features -> ' + merged.geometry.coordinates.length + ' polygons');
        }
    }

    jsonfile.writeFile(outputFile, newJson, function (err) {
        if (err) {
            console.error(err);
        }
    });
}