//Lets require/import the HTTP module
var http = require('http');
var definedNotNull = require('Cesium').definedNotNull;

//Lets define a port we want to listen to
const PORT=9000;

var latitude = 0;
var longitude = 0;

//We need a function which handles requests and send response
function handleRequest(request, response){
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    response.setHeader('Access-Control-Allow-Headers', '*');
    if ( request.method === 'OPTIONS' ) {
        response.writeHead(200);
        response.end();
        return;
    }

    response.setHeader('Content-type', 'application/vnd.google-earth.kml+xml');

    var kml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlns="http://www.opengis.net/kml/2.2">\n';

    var expires = new Date(Date.now() + 3000);

    kml +=
    '  <NetworkLinkControl>\n' +
    '    <expires>' + expires.toISOString() + '</expires>\n' +
    '    <minRefreshPeriod>10</minRefreshPeriod>\n' +
    '  </NetworkLinkControl>\n';

    console.log(request.url);
    if (request.url.indexOf('/points') !== -1) {
        kml +=
            '  <Placemark>\n' +
            '    <name>Random Placemark</name>\n' +
            '    <Point>\n' +
            '      <coordinates>' + longitude + ',' + latitude + '</coordinates>\n' +
            '    </Point>\n' +
            '  </Placemark>\n';
    } else if (request.url.indexOf('/ground') !== -1) {
        var regex = /BBOX=([0-9\.-]+),([0-9\.-]+),([0-9\.-]+),([0-9\.-]+)/;
        match = regex.exec(request.url);
        if (!definedNotNull(match) || match.length !== 5) {
            match = ['', '-180', '-90', '180', '90'];
        }
        kml +=
        '  <GroundOverlay>\n' +
        '    <name>GroundOverlay</name>\n' +
        '    <color>7fffffff</color>\n' +
        '    <LatLonBox>\n' +
        '      <north>' + match[4] + '</north>\n' +
        '      <south>' + match[2] + '</south>\n' +
        '      <east>' + match[3] + '</east>\n' +
        '      <west>' + match[1] + '</west>\n' +
        '    </LatLonBox>\n' +
        '  </GroundOverlay>\n';
    }

    kml += '</kml>';

    if (latitude > longitude) {
        longitude += 0.1;
    } else {
        latitude += 0.1;
    }
    response.end(kml);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});