const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
//const readline = require('readline-sync');
const fetch = require('node-fetch');
const path = require('path');
const http = require('http');
const url = require('url');

let db = new sqlite3.Database(path.join(__dirname, '../../data/airports.db'));
let airportsJSON = {}; // Contains IATA code as a key to an object that has the location as a key to the number of routes to that location
if (fs.existsSync(path.join(__dirname, '../../data/cities.json'))) {
    airportsJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/cities.json')));
}

let airportDBJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/airports.json')));
let capitalCitiesJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/capitalcities.json')));

db.allAsync = function (sql) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.all(sql, function (err, row) {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
};

apiKeys = ['effe71-62ff22', '56b653-bbf094'];
keyIndex = 0;

apiKey = '56b653-bbf094';
baseAPIUrl = 'http://aviation-edge.com/v2/public/routes';

apiUrl = baseAPIUrl + '?key=' + apiKey;
apiUrl = apiUrl + '&departureIata=';

async function selectData(query) {
    return rows = await db.allAsync(query)
}

async function requestAPIData(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

// Calculates the distance in km between two latitude and longitude points
function getHaversineDist(loc1, loc2){
    var r = 6371; // Radius of the Earth
    var dLat = (loc1.lat - loc2.lat) * Math.PI / 180; // Delta latitude in radians
    var dLong = (loc1.lng - loc2.lng) * Math.PI / 180; // Delta longitude in radians

    // Returns Haversine calculation
    return 2 * r * Math.asin(Math.sqrt(Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(loc2.lat * Math.PI / 180) * Math.cos(loc1.lat * Math.PI / 180) * Math.sin(dLong/2) * Math.sin(dLong/2)));
}

// Returns object containing the IATA code and coordinates of the closest airport to a given coordinates
function getClosestAirport(coords, invalidAirports) {
    let closestAirport = "";
    let closestCoords = {};

    let shortestDistance = 999;

    for(let j = 0; j < airportDBJSON.length; j++) {
        if("latitudeAirport" in airportDBJSON[j] && "longitudeAirport" in airportDBJSON[j]) {
            let dist = getHaversineDist(coords, {lat: airportDBJSON[j]["latitudeAirport"], lng: airportDBJSON[j]["longitudeAirport"]});
            if(dist <= 100 && dist < shortestDistance && !(invalidAirports.includes(airportDBJSON[j]["codeIataAirport"]))) {
                shortestDistance = dist;
                closestAirport = airportDBJSON[j]["codeIataAirport"];
                closestCoords = {lat: parseFloat(airportDBJSON[j]["latitudeAirport"]), lng: parseFloat(airportDBJSON[j]["longitudeAirport"])};
            }
        }
    }

    return {airport: closestAirport, coords: closestCoords};
}

// Get the destination count of a given airport IATA code
async function getDests(airportObj) {
    let destinationCount = {};
    let destLocs = {};
    let airport = airportObj.airport;

    console.log(airport);

    if(airport in airportsJSON) {
        console.log('Getting data from file');
        for(let loc in airportsJSON[airport]) {
            if(loc in destinationCount) {
                destinationCount[loc] += airportsJSON[airport][loc];
            } else {
                destinationCount[loc] = airportsJSON[airport][loc];
            }

            // Find IATA of loc, and then set lat and long
            locQuery = 'SELECT location_id FROM locations WHERE location = "' + loc + '"';
            locResults = await selectData(locQuery);

            airportQuery = "SELECT iata FROM airports WHERE location = " + locResults[0]["location_id"];
            airportResults = await selectData(airportQuery);

            locIata = airportResults[0]["iata"];

            for(let a = 0; a < airportDBJSON.length; a++) {
                if(locIata === airportDBJSON[a]["codeIataAirport"]) {
                    if("latitudeAirport" in airportDBJSON[a] && "longitudeAirport" in airportDBJSON[a]) {
                        destLocs[loc] = {lat: parseFloat(airportDBJSON[a]["latitudeAirport"]), lng: parseFloat(airportDBJSON[a]["longitudeAirport"])};
                        break;
                    }
                }
            }
        }
    } else {
        console.log('Getting data from API');
        airportsJSON[airport] = {};
        airportDataJSON = await requestAPIData(apiUrl + airport);

        if(!("error" in airportDataJSON)) {
            for(let j = 0; j < airportDataJSON.length; j++) {
                let destIata = airportDataJSON[j]["arrivalIata"];
                destQuery = "SELECT location from airports WHERE iata = '" + destIata + "'";
                destResult = await selectData(destQuery);

                if(destResult.length == 0) {
                    continue;
                }

                cityQuery = "SELECT location from locations WHERE location_id = '" + destResult[0]["location"] + "'";
                cityResult = await selectData(cityQuery);

                city = cityResult[0]["location"];

                for(let a = 0; a < airportDBJSON.length; a++) {
                    if(destIata === airportDBJSON[a]["codeIataAirport"]) {
                        if("latitudeAirport" in airportDBJSON[a] && "longitudeAirport" in airportDBJSON[a]) {
                            destLocs[city] = {lat: parseFloat(airportDBJSON[a]["latitudeAirport"]), lng: parseFloat(airportDBJSON[a]["longitudeAirport"])};
                            break;
                        }
                    }
                }

                if(city in airportsJSON[airport]) {
                    airportsJSON[airport][city] += 1
                } else {
                    airportsJSON[airport][city] = 1
                }

                if(city in destinationCount) {
                    destinationCount[city] += 1
                } else {
                    destinationCount[city] = 1
                }
            }
        }
    }

    let writeData = JSON.stringify(airportsJSON);
    fs.writeFileSync(path.join(__dirname, '../../data/cities.json'), writeData);

    return {destinationCount: destinationCount, destLocs: destLocs};
}

// Get the destination count of a given location string
async function main(location, coords) {
    let airports = []; // IATA codes of airports associated with given location
    let destinationCount = {}; // Keeps record of total number of routes to locations from given location
    let destLocs = {}; // Latitude and longitudes of destinations
    let totalLat = 0;
    let totalLng = 0;
    let airportCount = 0;
    let capitalCityFound = false;

    try {
        //let country = readline.question('Country?: ');
        //let location = readline.question('Location?: ');

        let locationSplit = location.split(',');
        let locationRegex = '';

        for(let i = 0; i < locationSplit.length; i++) {
            locationRegex = locationRegex + locationSplit[i].trim() + ', .*';
        }

        locationRegex = locationRegex.replace(/, \.\*$/, '');
        locationRegex = '.*' + locationRegex;

        selectLocationQuery = "SELECT * FROM locations";
        locations = await selectData(selectLocationQuery);

        for(let i = 0; i < capitalCitiesJSON.length; i++) {
            if(capitalCitiesJSON[i]["country"].toLowerCase() === location.toLowerCase()) {
                locationRegex = ".*" + capitalCitiesJSON[i]["city"] + ",.*" + location;
                break;
            }
        }

        for(let i = 0; i < locations.length; i++) {
            if(locations[i]["location"].toLowerCase().match(locationRegex.toLowerCase())) {
                selectAirportQuery = "SELECT iata FROM airports WHERE location=" + locations[i]["location_id"];
                airportResults = await selectData(selectAirportQuery);
                for(let j = 0; j < airportResults.length; j++) {
                    airports.push(airportResults[j]["iata"]);
                }
            }
        }

        if(coords.lat !== 999 && coords.lng !== 999) { // Use latitude and longitude to get closest airports
            console.log(location + ' - lat: ' + coords.lat + ', ' + 'lng: ' + coords.lng);
            for(let j = 0; j < airportDBJSON.length; j++) {
                if("latitudeAirport" in airportDBJSON[j] && "longitudeAirport" in airportDBJSON[j]) {
                    if(getHaversineDist(coords, {lat: airportDBJSON[j]["latitudeAirport"], lng: airportDBJSON[j]["longitudeAirport"]}) <= 100) {
                        if(airportDBJSON[j]["codeIataAirport"] !== "" && !(airports.includes(airportDBJSON[j]["codeIataAirport"]))) {
                            airports.push(airportDBJSON[j]["codeIataAirport"]);
                        }
                    }
                }
            }
        }

        console.log(airports);

        for(let i = 0; i < airports.length; i++) {
            for(let j = 0; j < airportDBJSON.length; j++) {
                if(airports[i] === airportDBJSON[j]["codeIataAirport"]) {
                    if("latitudeAirport" in airportDBJSON[j] && "longitudeAirport" in airportDBJSON[j]) {
                        totalLat += parseFloat(airportDBJSON[j]["latitudeAirport"]);
                        totalLng += parseFloat(airportDBJSON[j]["longitudeAirport"]);
                        airportCount++;
                    }
                }
            }
            if(airports[i] in airportsJSON) {
                console.log(airports[i] + ": Getting data from file");
                for(let loc in airportsJSON[airports[i]]) {
                    if(loc in destinationCount) {
                        destinationCount[loc] += airportsJSON[airports[i]][loc];
                    } else {
                        destinationCount[loc] = airportsJSON[airports[i]][loc];
                    }

                    // Find IATA of loc, and then set lat and long
                    locQuery = 'SELECT location_id FROM locations WHERE location = "' + loc + '"';
                    locResults = await selectData(locQuery);

                    airportQuery = "SELECT iata FROM airports WHERE location = " + locResults[0]["location_id"];
                    airportResults = await selectData(airportQuery);

                    locIata = airportResults[0]["iata"];

                    for(let a = 0; a < airportDBJSON.length; a++) {
                        if(locIata === airportDBJSON[a]["codeIataAirport"]) {
                            if("latitudeAirport" in airportDBJSON[a] && "longitudeAirport" in airportDBJSON[a]) {
                                destLocs[loc] = {lat: parseFloat(airportDBJSON[a]["latitudeAirport"]), lng: parseFloat(airportDBJSON[a]["longitudeAirport"])};
                                break;
                            }
                        }
                    }
                }
            } else {
                console.log(airports[i] + ": Getting data from API");
                airportsJSON[airports[i]] = {};
                airportDataJSON = await requestAPIData(apiUrl + airports[i]);

                if(!("error" in airportDataJSON)) {
                    for(let j = 0; j < airportDataJSON.length; j++) {
                        let destIata = airportDataJSON[j]["arrivalIata"];
                        destQuery = "SELECT location from airports WHERE iata = '" + destIata + "'";
                        destResult = await selectData(destQuery);

                        if(destResult.length == 0) {
                            continue;
                        }

                        cityQuery = "SELECT location from locations WHERE location_id = '" + destResult[0]["location"] + "'";
                        cityResult = await selectData(cityQuery);

                        city = cityResult[0]["location"];

                        for(let a = 0; a < airportDBJSON.length; a++) {
                            if(destIata === airportDBJSON[a]["codeIataAirport"]) {
                                if("latitudeAirport" in airportDBJSON[a] && "longitudeAirport" in airportDBJSON[a]) {
                                    destLocs[city] = {lat: parseFloat(airportDBJSON[a]["latitudeAirport"]), lng: parseFloat(airportDBJSON[a]["longitudeAirport"])};
                                    break;
                                }
                            }
                        }

                        if(city in airportsJSON[airports[i]]) {
                            airportsJSON[airports[i]][city] += 1
                        } else {
                            airportsJSON[airports[i]][city] = 1
                        }

                        if(city in destinationCount) {
                            destinationCount[city] += 1
                        } else {
                            destinationCount[city] = 1
                        }
                    }
                }
            }
        }

        let avgLat = totalLat/airportCount;
        let avgLng = totalLng/airportCount;

        console.log('Average latitude: ' + avgLat + ', Average longitude: ' + avgLng);

        let writeData = JSON.stringify(airportsJSON);
        fs.writeFileSync(path.join(__dirname, '../../data/cities.json'), writeData);

        return {destinationCount: destinationCount, avgLoc: {lat: avgLat, lng: avgLng}, destLocs: destLocs};
    } catch(e) {
        console.log(e);
    }
}


// Start server on port 3000
http.createServer(async function(req, res) {
    let parsed = url.parse(req.url, true);
    let destinations;
    res.writeHead(200, {'Content-Type': 'application/json'});
    if(parsed.query.type === 'locationOnly') {
        let location = parsed.query.location
        destinations = await main(location, {lat: 999, lng: 999}); // Only location was entered
        res.end(JSON.stringify({results: destinations.destinationCount, avgLoc: destinations.avgLoc, destLocs: destinations.destLocs}));
    } else if(parsed.query.type === 'diseaseOnly') {
        let location = parsed.query.location
        destinations = await main(location, {lat: parsed.query["coords[lat]"], lng: parsed.query["coords[lng]"]}); // Only disease was entered
        res.end(JSON.stringify({results: destinations.destinationCount, avgLoc: destinations.avgLoc, destLocs: destinations.destLocs}));
    } else if(parsed.query.type === 'closestDests') {
        let invalidAirports = [];
        let closestAirport = getClosestAirport({lat: parsed.query["coords[lat]"], lng: parsed.query["coords[lng]"]}, invalidAirports); // Get IATA code of closest airport
        if(closestAirport.airport === "") {
            res.end(JSON.stringify({results: {}, closestLoc: {}, destLocs: {}}));
        } else {
            destinations = await getDests(closestAirport);
            while(!Object.keys(destinations.destinationCount).length) {
                invalidAirports.push(closestAirport.airport);
                closestAirport = getClosestAirport({lat: parsed.query["coords[lat]"], lng: parsed.query["coords[lng]"]}, invalidAirports); // Get IATA code of closest airport
                if(closestAirport.airport === "") {
                    res.end(JSON.stringify({results: {}, closestLoc: {}, destLocs: {}}));
                    break;
                } else {
                    destinations = await getDests(closestAirport);
                }
            }
            res.end(JSON.stringify({results: destinations.destinationCount, closestLoc: closestAirport.coords, destLocs: destinations.destLocs}));
        }
    }
}).listen(3000);