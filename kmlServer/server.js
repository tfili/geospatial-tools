//Lets require/import the HTTP module
var http = require('http');
var definedNotNull = require('Cesium').definedNotNull;

//Lets define a port we want to listen to
const PORT=9000;

var latitude = 0;
var longitude = 0;

function networkLinkControl(url) {
    var expires = new Date(Date.now() + 3000);
    var kml =
        '  <NetworkLinkControl>\n' +
        '    <expires>' + expires.toISOString() + '</expires>\n' +
        '    <minRefreshPeriod>10</minRefreshPeriod>\n';
    if (url.indexOf('/update') !== -1) {
        kml += '    <cookie>update=1</cookie>\n';
    }
    if (url.indexOf('update=1') !== -1) {
        kml += '<Update><Change><Point targetId="random_point"><coordinates>0,0,0</coordinates></Point></Change></Update>';
    }
    kml += '  </NetworkLinkControl>\n';

    return kml;
}

function point() {
    var kml =
        '  <Placemark id="random_point">\n' +
        '    <name>Random Placemark</name>\n' +
        '    <Point>\n' +
        '      <coordinates>' + longitude + ',' + latitude + '</coordinates>\n' +
        '    </Point>\n' +
        '  </Placemark>\n';

    if (latitude > longitude) {
        longitude += 0.1;
    }
    else {
        latitude += 0.1;
    }

    return kml;
}

function groundOverlay(url) {
    var regex = /BBOX=([0-9\.-]+),([0-9\.-]+),([0-9\.-]+),([0-9\.-]+)/;
    match = regex.exec(url);
    if (!definedNotNull(match) || match.length !== 5) {
        match = ['', '-180', '-90', '180', '90'];
    }
    var kml =
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

    return kml;
}

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

    console.log(request.url);

    response.setHeader('Content-type', 'application/vnd.google-earth.kml+xml');

    var kml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlns="http://www.opengis.net/kml/2.2">\n';

    kml += networkLinkControl(request.url);

    // No update so add placemarks
    if (request.url.indexOf('update=1') === -1) {
        if (request.url.indexOf('/points') !== -1) {
            kml += point();
        }
        else if (request.url.indexOf('/ground') !== -1) {
            kml += groundOverlay(request.url);
        }
    }

    kml += '</kml>';
    response.end(kml);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});