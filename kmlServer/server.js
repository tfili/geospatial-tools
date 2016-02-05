//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
const PORT=9000;

var latitude = 0;
var longitude = 0;

//We need a function which handles requests and send response
function handleRequest(request, response){
    var kml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlns="http://www.opengis.net/kml/2.2">\n' +
    '  <Placemark>\n' +
    '    <name>Random Placemark</name>\n' +
    '    <Point>\n' +
    '      <coordinates>' + longitude + ',' + latitude + '</coordinates>\n' +
    '    </Point>\n' +
    '  </Placemark>\n' +
    '</kml>';

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