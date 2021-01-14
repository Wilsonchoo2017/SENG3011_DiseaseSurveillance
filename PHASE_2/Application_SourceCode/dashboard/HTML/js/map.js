import API from './api.js'
import { getClosestAirportDests } from './apiData.js'

const api  = new API();
const API_URL = 'http://localhost:5100/articles/details'

let flightLines = [];
let flightMarkers = [];

main()

// default onload behaviour for map module
async function main() {
	var returnedDates = getDates()
	var fortnightAgo = returnedDates[0]
	var aDayAgo = returnedDates[1]
	var now = returnedDates[2]

	// fetch all articles from the past fortnight
	let articles = await api.getArticlesDetails(fortnightAgo, aDayAgo , "", [])

	// plot the returned locations reports - all reports of the past fortnight (default)
	plotMap(articles,0, 0, 2)

	// plot input date/disease/location from user
	document.getElementById("dataSubmit").addEventListener("click", plotInput);

}

// gets dates of a fortnight ago and the day before the current time in a tangible format
function getDates() {
	// Grab current date time
	var now = new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0]

	// calculate the date time a fortnight ago
	var d = new Date();
	d.setDate(d.getDate() - 14); // past fortnight  when public api is up again and scraper regullarly scrapes - past month for this dmeo as default

	var fortnightAgo = new Date(d.toString().split('GMT')[0]+' UTC').toISOString().split('.')[0]

	var b = new Date();
	b.setDate(b.getDate() - 1); // past fortnight  when public api is up again and scraper regullarly scrapes - past month for this dmeo as default

	var aDayAgo = new Date(b.toString().split('GMT')[0]+' UTC').toISOString().split('.')[0]

	return [fortnightAgo, aDayAgo, now]
}

// plots map according to user input
async function plotInput() {
	// find the articles corresponding to user input

	let startTime = document.getElementById("startTime").value;
  	let endTime = document.getElementById("endTime").value;
  	let location = $('#location').val();
  	let keyTerms = $('#keyTerms').val();

	// process start date and end date entered by user
	startTime = datefix(startTime)
	endTime = datefix(endTime)
	let start = new Date(startTime).toISOString()
	let end = new Date(endTime).toISOString()
	start = escape(start)
	end = escape(end)
	start = start.replace('.000Z', '')
	end = end.replace('.000Z', '')

	// replace the commas in keytearms with %2C - compatible to api call url
	keyTerms = escape(keyTerms)


	// location
	let articles = await api.getArticlesDetails(start, end , location, keyTerms)

	var avgLocation = findAvgLocation(articles)
	var avgLat = avgLocation[0]
	var avgLong = avgLocation[1]

	if (location === "" && keyTerms === ""){ 
		plotMap(articles,0, 0,1.5)
		document.getElementById("maptitle").innerText = "Recent Disease Reports (Past Fortnight)"
	} else{
		plotMap(articles,avgLat,avgLong,5)
		document.getElementById("maptitle").innerText = "Recent Disease Reports (between the searched times)"
		document.getElementById("bar-header").innerText = "Most Commonly Reported Diseases (between the searched times)";
	}
}

function datefix(string) {
  var abc = string.split('/')

  var newString = abc[1] +'/'+ abc[0] +'/'+ abc[2]
  return newString
}

// find the average longitude and latitude for all locations for reports
function findAvgLocation(articles) {
	var latSum = 0;
	var longSum = 0;
	for(var i = 0; i < articles.length; i++){
		latSum = latSum + articles[i].latitude;
		longSum = longSum + articles[i].longitude;
	}
	var latAvg = latSum/(i)
	var longAvg = longSum/(i)

	return [latAvg, longAvg];
}


// The following section of code was borrowed from the internet
// https://www.designedbyaturtle.co.uk/convert-string-to-hexidecimal-colour-with-javascript-vanilla/

// Hash any string into an integer value
// Then we'll use the int and convert to hex.
function hashCode(str) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
}

// Convert an int to hexadecimal with a max length
// of six characters.
function intToARGB(i) {
	var hex = ((i>>24)&0xFF).toString(16) +
		  ((i>>16)&0xFF).toString(16) +
		  ((i>>8)&0xFF).toString(16) +
		  (i&0xFF).toString(16);
  	// Sometimes the string returned will be too short so we
  	// add zeros to pad it out, which later get removed if
  	// the length is greater than six.
  	hex += '000000';
  	return hex.substring(0, 6);
}

// Extend the string type to allow converting to hex for quick access.
String.prototype.toHexColour = function() {
	return intToARGB(hashCode(this));
}


// https://developers.google.com/maps/documentation/javascript/examples/circle-simple
// https://stackoverflow.com/questions/3059044/google-maps-js-api-v3-simple-multiple-marker-example
// plots given articles on map
var map;

function plotMap(articles, latZoom, longZoom, zoom) {

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: zoom,
		center: new google.maps.LatLng(latZoom, longZoom),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});


	var marker, i, circle;

	for (i = 0; i < articles.length; i++) {

		// estimate the number of ppl affected for radius of circle marker
		var string = articles[i].headline
		var numbers = [];
		if (string.match(/\d+/g) === null) {

		} else {
			numbers = string.match(/\d+/g).map(n => parseInt(n));
		}



		if (numbers === null){
		}

		var radiusScale;
		if(numbers.length != 0){
			radiusScale= numbers[0];
		} else {
			radiusScale = 1;
		}

		// find colour for disease
		var colour = articles[i].disease[0].toHexColour(); // need to copy the functions over


		var radius = 0;
		// decide radius
		if (radiusScale < 50){
			radius = 15000
		} else if (radiusScale < 100){
			radius = 20000
		} else if (radiusScale < 500){
			radius = 25000
		} else {
			radius = 30000
		}

		var circle = new google.maps.Marker({
		  position: {lat: articles[i].latitude, lng: articles[i].longitude},
		  map: map,
		  icon: {
		    path: google.maps.SymbolPath.CIRCLE,
		    fillOpacity: 0.8,
		    fillColor: '#'+colour,
		    strokeOpacity: 0.35,
		    strokeColor: '#'+colour,
		    strokeWeight: 0,
		    scale: radius/2000//20 //pixels
		  }
		});

		var infowindow = new google.maps.InfoWindow();

		google.maps.event.addListener( circle, 'click', (function( circle, i) {
			return function() {
				var num = articles[i].number_affected
				if (num === undefined){
				  	num = "--";
				}
				var date = articles[i].date.replace("T", " ")
				infowindow.setContent(date + "<br><strong>" + articles[i].location + ", " + articles[i].country + "</strong><br>" +articles[i].headline + "<br>"+  " <br><a href=" + articles[i].details_url + " target='_blank'>See more details</a>");
				//infowindow.setPosition(circle.getCenter());
				infowindow.open(map,circle);
                getClosestAirportDests(articles[i].latitude, articles[i].longitude, articles[i].location + ", " + articles[i].country);

				//plotAirport(map); // pass in as parameter the long and lat location to plot

		  	}
		})( circle, i));
	}

}

export function airportMap(airportCoords, top5Dest, top5DestCoords) {

	plotAirport(airportCoords, top5Dest, top5DestCoords)


}

// by default when searched by country
// closest city or capital city of the country

//plots the airport
function plotAirport(airportCoords, top5Dest, top5DestCoords){
    flightLines.map(function(l) {l.setMap(null)});
    flightMarkers.map(function(m) {m.setMap(null)});

    flightLines = [];
    flightMarkers = [];
	var airport_icon = {
			url: "https://cdn3.iconfinder.com/data/icons/toolbar-signs-5/512/flight_plane_travel_transportation_flights-512.png",
		    //url: "../res/sit_marron.png", // url
		    scaledSize: new google.maps.Size(25, 25), // scaled size
		    origin: new google.maps.Point(0,0), // origin
		    anchor: new google.maps.Point(0, 0) // anchor
	};
	var plot_location = airportCoords//{lat: 0, lng: 0}

	addMarker(plot_location, map, airport_icon, "");


	// plot destinations
	var destination_icon = {
		url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
	};

	for (var i = 0; i < top5DestCoords.length; i++){
		// add destination marker to map
		addMarker(top5DestCoords[i], map, destination_icon, top5Dest[i]);

		// flight path mark
		var flightPath = new google.maps.Polyline({
	        path: [plot_location, top5DestCoords[i]],
	        geodesic: true,
	        strokeColor: '#FF0000',
	        strokeOpacity: 1.0,
	        strokeWeight: 2
    	});

    	flightPath.setMap(map);
        flightLines.push(flightPath);
	}


}


// plots the given marker at the given location on a given map
function addMarker(location, map, icon, loc) {

        // Add the marker at the clicked location, and add the next-available label
        // from the array of alphabetical characters.
        var marker = new google.maps.Marker({
          position: location,
          animation: google.maps.Animation.DROP,
          map: map,
          icon: icon
        });

        if(loc !== "") {
            var infowindow = new google.maps.InfoWindow({
              content: loc
            });

            marker.addListener('click', function() {
              infowindow.open(map, marker);
            });
        }

        flightMarkers.push(marker);
}


// look at online sameple maps for survellance