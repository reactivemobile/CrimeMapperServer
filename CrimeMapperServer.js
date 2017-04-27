var http = require("http");
var url = require('url');

var port = process.env.PORT || 3000;
var policeUrl = "https://data.police.uk/api/crimes-street-dates";
var cachedAvailabilityValue;
var globalResponse;
var cachedResponse;

var cachedResponseTime = Date.now();

console.log( 'Running client at '+__filename );

function handleCallback(error, response, body) {
	var jsonObject = JSON.parse(body);

	for(var i in jsonObject){
		delete jsonObject[i]['stop-and-search'];
	}

	cachedResponse = JSON.stringify(jsonObject);
	cachedResponseTime = Date.now();

	sendResponseData(cachedResponse);	
}

function sendResponseData(responseData){
	globalResponse.writeHead(200, {'Content-Type':'application/json'})
	globalResponse.end(responseData);
}

function sendError(errorResponse)
{
	globalResponse.writeHead(404, {'Content-Type':'text/plain'});		
	globalResponse.end(errorResponse);
}

function getAvailability()
{
	var request = require("request");
	request(policeUrl, handleCallback);
}

http.createServer(function (request, response){
	globalResponse = response;

	if(url.parse(request.url).pathname == "/police/availability")
	{
		if(cachedResponse == null || (Date.now() - cachedResponseTime) > 86400000)
		{
			console.log("Getting fresh data");
			getAvailability();
		}
		else
		{
			console.log("Using cached response ");
			sendResponseData(cachedResponse);
		}
	}
	else
	{
		sendError("Not found")
	}
}).listen(port);