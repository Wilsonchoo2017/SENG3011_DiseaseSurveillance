import { airportMap } from './map.js'

document.getElementById("dataSubmit").addEventListener("click", submitData);

$('#dataSubmit').click(function (e) {
    e.preventDefault();
});

function loadExtraHTML() {
  document.getElementById('endTime').max = new Date().toISOString().split("T")[0];
}

var startpicker = new Lightpick({
    field: document.getElementById('startTime'),
    secondField: document.getElementById('endTime'),
    repick: true,
    singleDate: false,
});

export async function getClosestAirportDests(lat, lng, loc) {
    let type = 'closestDests';
    $('#flightPanel').empty();
    let ajaxQuery = await $.ajax({url: 'http://localhost:3000', data: {type: type, coords: {lat: lat, lng: lng}}});

    let results = ajaxQuery.results;
    let closestLoc = ajaxQuery.closestLoc;

    if(Object.entries(closestLoc).length === 0 && closestLoc.constructor === Object) { // Don't show anything if there are no results
        $('#flightPanel').append($('<h5>No Destinations for ' + loc + '</h5>'));
        return;
    }

    let destCoords = ajaxQuery.destLocs;
    let topFive = getTopFive(results);
    let topFiveCoords = [];

    for(let i = 0; i < topFive.length; i++) {
        topFiveCoords.push(destCoords[topFive[i]]);
    }
    airportMap(closestLoc, topFive, topFiveCoords);

    $('#flightPanel').append($('<h5>Top Destinations for ' + loc + '</h5>'));
    for(let i = 0; i < topFive.length; i++) {
        $('#flightPanel').append(topFive[i] + '<br>');
    }
}

function generateTable($table) {
    let $header = $('<thead></thead>');
    let $body = $('<tbody></tbody>');
    $table.append($header);
    $table.append($body);
    let $headerRow = $('<tr></tr>');
    $header.append($headerRow);

    $headerRow.append($('<th>Disease</th>'));
    $headerRow.append($('<th>Time</th>'));
    $headerRow.append($('<th>Country</th>'));
    $headerRow.append($('<th>Location</th>'));
    $headerRow.append($('<th>Type</th>'));
    $headerRow.append($('<th>Headline</th>'));
}


/*
 * Generates Row for Report Table
 */
function generateRow($table, article) {
    let $body = $table.find('tbody');
    let $row = $('<tr></tr>');
    $body.append($row);
    let diseaseTD = document.createElement("td");
    
    // Add quality of life UX to report tables
    diseaseTD.appendChild(document.createTextNode(article.disease[0]));
    diseaseTD.setAttribute("data-toggle", "tooltip");
    diseaseTD.setAttribute("title", "Click to search this disease");
    diseaseTD.addEventListener('click', function () {
        document.getElementById('keyTerms').value = article.disease[0];
        document.getElementById('location').value = '';
        submitData();
    }, false);
    $row.append(diseaseTD);

    let options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    let date = new Date(article.date);
    $row.append($('<td>' + date.toLocaleString('en-us',options) + '</td>'));

    // Add quality of life UX to report tables
    let countryTD = document.createElement("td");
    countryTD.appendChild(document.createTextNode(article.country));
    countryTD.setAttribute("data-toggle", "tooltip");
    countryTD.setAttribute("title", "Click to search this location");
    countryTD.addEventListener('click', function () {
        document.getElementById('keyTerms').value = '';
        document.getElementById('location').value = article.country;
        submitData();
    }, false);
    $row.append(countryTD);

    // Add quality of life UX to report tables
    let locationTD = document.createElement("td");
    locationTD.appendChild(document.createTextNode(article.location));
    locationTD.setAttribute("data-toggle", "tooltip");
    locationTD.setAttribute("title", "Click to search this location");
    locationTD.addEventListener('click', function () {
        document.getElementById('keyTerms').value = '';
        document.getElementById('location').value = article.location;
        submitData();
    }, false);
    $row.append(locationTD);

    $row.append($('<td>' + article.type + '</td>'));
    let urlTD = document.createElement("td");
    let a = document.createElement("a");
    a.innerText = article.headline;
    a.setAttribute("href", article.details_url);
    a.setAttribute("target", "_blank");
    urlTD.appendChild(a);
    $row.append(urlTD);
    $row.attr('data-lat', article.latitude);
    $row.attr('data-lng', article.longitude);
}

function datefix(string) {
  var abc = string.split('/')
  var newString = abc[1] +'/'+ abc[0] +'/'+ abc[2]
  return newString
}

async function submitData() {
    getCommonReport();
    getReportBar();
    getReportLine();
    let startTime = document.getElementById("startTime").value;
    let endTime = document.getElementById("endTime").value;
    
        
    let start;
    let end;
    if (startTime == '' || endTime == '')
    {
        let endString = new Date().toISOString().slice(0, 10);
        let date = new Date();
        date.setDate(date.getDate() - 28);
        let startString = date.toISOString().slice(0, 10);
        start = startString + 'T00:00:00';
        end = endString + 'T00:00:00';

    } else {
        startTime = datefix(startTime)
        endTime = datefix(endTime)


        start = new Date(startTime).toISOString()
        end = new Date(endTime).toISOString()
    }

    let location = $('#location').val();
    let keyTerms = $('#keyTerms').val();

    startTime = datefix(startTime)
    endTime = datefix(endTime)


    start = escape(start)
    end = escape(end)
    start = start.replace('.000Z', '')
    end = end.replace('.000Z', '')
    keyTerms = keyTerms.replace(',', '%2C')


    let base_url = 'http://46.101.167.163:5100/articles/details';

    let $resultsTable = $('#resultsTable');
    $resultsTable.empty();
    generateTable($resultsTable);

    if(location === '' && keyTerms === '') {
        let url = `${base_url}?start%20time=${start}&end%20time=${end}`;
        await sendRequest(url);
    } else if(location !== '' && keyTerms === '') {
        location = location.replace(/\s/g,'') //remove whitespace
        var locationArray = location.split(',') //get list of locations
        for(let i = 0; i < locationArray.length; i++) {
            let url = `${base_url}?start%20time=${start}&end%20time=${end}&location=${locationArray[i]}`
            await sendRequest(url)
        }
    } else if(location === '' && keyTerms !== '') {
        let url = `${base_url}?start%20time=${start}&end%20time=${end}&keyterms=${keyTerms}`;
        await sendRequest(url);
    } else {
        location = location.replace(/\s/g,'') //remove whitespace
        locationArray = location.split(',') //get list of locations
        for(let i = 0; i < locationArray.length; i++) {
            let url = `${base_url}?start%20time=${start}&end%20time=${end}&keyterms=${keyTerms}&location=${locationArray[i]}`
            await sendRequest(url)
        }
    }

    getFlightData();
    //plotInput();
}

function getTopFive(destinationsJSON) {
    let topFive = [];
    let destinations = Object.keys(destinationsJSON);

    destinations.sort(function(a, b){return destinationsJSON[b] - destinationsJSON[a]});

    for(let i = 0; i < 5 && i < destinations.length; i++) {
        topFive.push(destinations[i]);
    }

    return topFive;
}

function getTopFiveLocations() { // Get the top 5 locations for each unique disease in the table
    let topFive = {diseases: {}, coords:{}};
    let locationCount = {};
    let locationCoords = {};

    let $tableBody = $('#resultsTable > tbody').first();

    $tableBody.find('tr').each(function() {
        let latitude = $(this).attr('data-lat');
        let longitude = $(this).attr('data-lng');

        let coords = {lat: latitude, lng: longitude};

        let disease = $(this).find('td').eq(0).text();
        let location = $(this).find('td').eq(3).text() + ', ' + $(this).find('td').eq(2).text();
        locationCoords[location] = coords;
        if(disease in locationCount) {
            if(location in locationCount[disease]) {
                locationCount[disease][location] += 1;
            } else {
                locationCount[disease][location] = 1;
            }
        } else {
            locationCount[disease] = {};
            locationCount[disease][location] = 1;
        }
    });

    for(let disease in locationCount) {
        let topFiveLocations = getTopFive(locationCount[disease]);
        topFive.diseases[disease] = topFiveLocations;
        for(let i = 0; i < topFiveLocations.length; i++) {
            topFive.coords[disease] = topFiveLocations.map(function(l) {
                return locationCoords[l];
            });
        }
    }

    return topFive;
}

async function getFlightData() {
    let location = $('#location').val();
    let keyTerms = $('#keyTerms').val();
    let type = '';

    $('#flightPanel').empty();

    if((location === '' && keyTerms !== '')) {
        type = 'diseaseOnly';
        let diseaseLocations = getTopFiveLocations(); // Get top 5 locations for each disease
        for(let disease in diseaseLocations.diseases) { // For each disease's location, tally the number destinations
            let destinationCount = {};
            $('#flightPanel').append($('<h5>Top Destinations for ' + disease + '</h5>'));
            for(let i = 0; i < diseaseLocations.diseases[disease].length; i++) {
                let ajaxQuery = await $.ajax({url: 'http://localhost:3000', data: {type: type, location: diseaseLocations.diseases[disease][i], coords: diseaseLocations.coords[disease][i]}});
                let results = ajaxQuery.results;
                for(let destination in results) {
                    if(destination in destinationCount) {
                        destinationCount[destination] += results[destination];
                    } else {
                        destinationCount[destination] = results[destination];
                    }
                }
            }

            let topFive = getTopFive(destinationCount); // Get top 5 total destinations
            for(let i = 0; i < topFive.length; i++){
                $('#flightPanel').append(topFive[i]);
                $('#flightPanel').append('<br>');
            }
            $('#flightPanel').append('<br>');
        }
    } else if((location !== '' && keyTerms === '') || (location !== '' && keyTerms !== '')) {
        type = 'locationOnly';
        let diseaseLocations = {};
        location = location.replace(/\s/g,'') //remove whitespace
        var locationArray = location.split(',') //get list of locations
        for(let i = 0; i < locationArray.length; i++) { // For each location in search bar, get top 5 destinations
            let ajaxQuery = await $.ajax({url: 'http://localhost:3000', data: {type: type, location: locationArray[i]}});
            let results = ajaxQuery.results;
            let locCoords = ajaxQuery.avgLoc;
            let destCoords = ajaxQuery.destLocs;
            let topFive = getTopFive(results);
            let topFiveCoords = [];
            $('#flightPanel').append($('<h5>Top Destinations for ' + locationArray[i] + '</h5>'));
            for(let i = 0; i < topFive.length; i++){
                topFiveCoords.push(destCoords[topFive[i]]);
                $('#flightPanel').append(topFive[i]);
                $('#flightPanel').append('<br>');
            }
            $('#flightPanel').append('<br>');
            if(location !== '' && keyTerms !== '') {
                setTimeout(function(){
                    airportMap(locCoords, topFive, topFiveCoords);
                }, 1500);
            } else {
                airportMap(locCoords, topFive, topFiveCoords);
            }
            //

            // locCords - is {lat: lng:} of the coord of the capital city of the searched country , otherwise its the nearby airports of the searchc ity - average
            // destCoords -  (for any location) a object of keys which are the locations in the string format and the value is the object lat and long
            // topFive - an array fo strings of the top five destination for a location

            //
            //return [destCoords, topFive]

        }
    }
}

async function sendRequest(url) {
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const response = await fetch(proxyurl + url);
    const data = await response.json();

    let $resultsTable = $('#resultsTable');
    if(data.length > 0) {

    } else {
        alert('No results!');
    }
    for(let i = 0; i < data.length; i++) {
        generateRow($resultsTable, data[i]);
    }
    $('#resultsTable').tablesorter().trigger('updateAll');
}



function getCount(json, disease)
{
    var count = 0;
    for (var i = 0; i < json.length; i++) {
        if (json[i].disease[0] === disease) {
            count++;
        }
    }
    return count;
}


function compareChangedData(firstData, secondData) {
    let id = document.getElementById("disease-reported");
    while (id.firstChild) {
        id.removeChild(id.firstChild);
    }
    // find the increase only
    let a = [];

    for(let i = 0; i < firstData.length; i++){
        for(let j = 0; j < secondData.length; j++){
            if(firstData[i][0] === secondData[j][0]){
                //check if data is increased or decreased

                if (firstData[i][1] > secondData[j][1]) {
                    // there's an increase of report
                    let total = firstData[i][1] - secondData[j][1];
                    let pushData = firstData[i];
                    pushData.push(total);
                    a.push(pushData);
                }
                break;
            }
        }
    }
    if (a.length == 0) {
        generateReportLi(id, "There is no increase in reports!", "");
        id = document.getElementById("prediction");
            while (id.firstChild) {
        id.removeChild(id.firstChild);
        }
        generateReportLi(id , "Prediction is unavailable", ""); 
    } else {

        a.sort(function (first, second) {
            return second[2] - first[2];
        });

        for (let i = 0; i < a.length; i++) {
            let percent = Math.floor((a[i][2] / a[i][1]) * 100);
            generateReportLi(id, a[i][0], "+" + a[i][2] + ", +" + percent + "%" + ", " + a[i][1]);
            findPrediction(id, a[i][0])
        }
    }
}

function findPrediction(id, disease) {
    let diseasePred = disease.replace(/Meningitis Outbreak ( Suspected or Confirmed)/gi, "Meningitis Outbreak")
    diseasePred = diseasePred.replace(/Swine Flu - Confirmed \/ Possible Related Death|Swine Flu - Confirmed Cases/gi, "Swine Flu")
    let date = document.getElementById("endTime").value;
    let dateObj = new Date(datefix(date))
    date = dateObj.setDate(dateObj.getDate()+7)
    let country = document.getElementById("location").value;
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    let base_url = 'http://46.101.167.163:5100/articles/prediction';
    // let base_url = 'http://127.0.0.1:5100/articles/prediction'
    let url = `${base_url}?date=${escape(dateObj.toISOString())}&country=${escape(country)}&disease=${escape(diseasePred)}`;
    fetch(proxyurl + url)
        .then((response) => response.json())
        .then(function (json) {
            id = document.getElementById("prediction");
            generateReportLi(id, "Next weeks prediction: " + disease, json.prediction);
        })
    return
}


function generateReportLi(id, disease, text) {
    let li = document.createElement("li");
    let header = document.createElement("span");
    let body = document.createElement("span");
    li.setAttribute("class", "list-group-item d-flex px-3");
    header.setAttribute("class", "text-semibold text-fiord-blue")
    header.appendChild(document.createTextNode(disease));
    if (text != '') {
        header.setAttribute("data-toggle", "tooltip");
        header.setAttribute("title", "Click to search this disease");
        header.addEventListener('click', function () {
            document.getElementById('keyTerms').value = disease;
            document.getElementById('location').value = '';
            submitData();
        }, false);
    }

    body.setAttribute("class", "ml-auto text-right text-semibold");
    body.setAttribute("style", "color: green");
    body.appendChild(document.createTextNode(text));
    li.appendChild(header);
    li.appendChild(body);
    id.appendChild(li);
}



clearSearchBar();
submitData();

function clearSearchBar()
{
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('keyTerms').value = '';
    document.getElementById('location').value = '';
}
// This function gets the Common Report GLOBALLY
function getCommonReport() {
    let startString = new Date().toISOString().slice(0, 10);
    let date = new Date();
    date.setDate(date.getDate() - 29);
    let endString = date.toISOString().slice(0, 10);
    startString = startString + 'T00:00:00';
    endString = endString + 'T00:00:00';


    startString = escape(startString);
    endString = escape(endString);
    startString = startString.replace('.000Z', '');
    endString = endString.replace('.000Z', '');

    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    let base_url = 'http://46.101.167.163:5100/articles/details';
    //let base_url = "http://127.0.0.1:5100/articles/details";

    let location = $('#location').val();
    let keyTerms = $('#keyTerms').val();

    let url = `${base_url}?start%20time=${endString}&end%20time=${startString}&keyterms=${keyTerms}&location=${location}`;

    fetch(proxyurl + url)
        .then((response) => response.json())
        .then(function (json) {
            // seperate data fortnightly

            date.setDate(date.getDate() + 14);

            let checkDate = date.toISOString().slice(0, 10);
            checkDate = checkDate + 'T00:00:00';
            let firstjson = [];
            let secondjson = [];
            let d1;
            let d2 = new Date(checkDate);

            for (let i = 0; i < json.length; i++) {
                d1 = new Date(json[i].date);

                if (d1.getTime() >= d2.getTime()) {
                    // first fortnight ago
                    firstjson.push(json[i]);
                } else {
                    // second fortnight ago
                    secondjson.push(json[i]);
                }

            }

            let firstSet = new Set();
            let secondSet = new Set();

            for (let i = 0; i < firstjson.length; i++) {
                if (!firstSet.has(json[i].disease[0])) {
                    firstSet.add(json[i].disease[0]);
                }
            }

            for (let i = 0; i < secondjson.length; i++) {
                if (!secondSet.has(json[i].disease[0])) {
                    secondSet.add(json[i].disease[0]);
                }
            }


            let firstCont = {};
            for (let item of firstSet) {
                firstCont[item] = getCount(firstjson, item);
            }

            // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
            // Create items array
            let firstItems = Object.keys(firstCont).map(function (key) {
                return [key, firstCont[key]];
            });

            // Sort the array based on the second element
            firstItems.sort(function (first, second) {
                return second[1] - first[1];
            });


            let secondCont = {};
            for (let item of secondSet) {
                secondCont[item] = getCount(secondjson, item);
            }

            // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
            // Create items array
            let secondItems = Object.keys(secondCont).map(function (key) {
                return [key, secondCont[key]];
            });

            // Sort the array based on the second element
            secondItems.sort(function (first, second) {
                return second[1] - first[1];
            });

            // insert analytics stuff here
            compareChangedData(firstItems, secondItems);
        });
}

function dateReformat(string) {
  var abc = string.split('/')

  var newString = abc[2] +'-'+ abc[1] +'-'+ abc[0]
  return newString
}

function getReportBar() {
    let startTime = document.getElementById("startTime").value;
    let endTime = document.getElementById("endTime").value;
    let startString = new Date().toISOString().slice(0, 10);
    let date = new Date();
    date.setDate(date.getDate() - 28);
    let endString = date.toISOString().slice(0, 10);
    if (startTime === "" && endTime === "") {
    } else {
        startTime = dateReformat(startTime); // reformat date to taken from input
        endTime = dateReformat(endTime);     // to the format required to search API
        endString = new Date(startTime).toISOString().slice(0,10);
        startString = new Date(endTime).toISOString().slice(0,10);
    }

    startString = startString + 'T00:00:00';
    endString = endString + 'T00:00:00';


    startString = escape(startString);
    endString = escape(endString);
    startString = startString.replace('.000Z', '');
    endString = endString.replace('.000Z', '');

    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    let base_url = 'http://46.101.167.163:5100/articles/details';

    let location = $('#location').val();
    let keyTerms = $('#keyTerms').val();

    let url = `${base_url}?start%20time=${endString}&end%20time=${startString}&keyterms=${keyTerms}&location=${location}`;

    fetch(proxyurl + url)
        .then((response) => response.json())
        .then(function(json) {

            let newSet = new Set();

            for (let i = 0; i < json.length; i++){
                if(!newSet.has(json[i].disease[0]))
                {
                    newSet.add(json[i].disease[0]);
                }
            }


            let newCont = {};
            for (let item of newSet) {
                newCont[item] = getCount(json, item);
            }

            // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
            // Create items array
            let allItems = Object.keys(newCont).map(function(key) {
                return [key, newCont[key]];
            });

            // Sort the array based on the second element
            allItems.sort(function(first, second) {
                return second[1] - first[1];
            });

            (function ($) {
              $(document).ready(function () {

                //
                //  Horizontal Bar Graph
                //
                var total = 0;
                for (let i = 0; i < allItems.length; i++){
                  total=total+allItems[i][1];
                }
                // Data
                var res1 = allItems[0][0];
                var res2 = allItems[1][0];
                if(res1.includes("Swine Flu - Confirmed / Possible")){
                        res1 = "Swine Flu - Possible Related Death";
                }
                if(res2.includes("Swine Flu - Confirmed / Possible")){
                        res2 = "Swine Flu - Possible Related Death";
                }
                var ubdData = {
                  datasets: [{
                    hoverBorderColor: '#ffffff',
                    data: [allItems[0][1], allItems[1][1], (total-allItems[0][1]-allItems[1][1])],
                    backgroundColor: [
                      'rgba(0,123,255,0.9)',
                      'rgba(0,123,255,0.5)',
                      'rgba(0,123,255,0.3)'
                    ]
                  }],
                  labels: [res1, res2, "Other"]
                };

                // Options
                var ubdOptions = {
                  legend: {
                    display: false,
                    position: 'bottom',
                    labels: {
                      padding: 25,
                      boxWidth: 20
                    }
                  },
                  cutoutPercentage: 0,
                  tooltips: {
                    custom: false,
                    mode: 'index',
                    position: 'nearest'
                  },
                  scales: {
                      xAxes: [{
                          ticks: {
                              beginAtZero: true
                          }
                      }]
                  }
                };
                if(window.ubdChart != null)
                {
                    window.ubdChart.destroy();
                }
                var ubdCtx = document.getElementsByClassName('disease-bar')[0];

                // Generate the graph
                window.ubdChart = new Chart(ubdCtx, {
                  type: 'horizontalBar',
                  data: ubdData,
                  options: ubdOptions,
                });

              });
            })(jQuery);




        });
}

function getReportLine() {
    let startString = new Date().toISOString().slice(0, 10);
    let date = new Date();
    date.setDate(date.getDate() - 28);
    let endString = date.toISOString().slice(0, 10);
    startString = startString + 'T00:00:00';
    endString = endString + 'T00:00:00';


    startString = escape(startString);
    endString = escape(endString);
    startString = startString.replace('.000Z', '');
    endString = endString.replace('.000Z', '');

    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    let base_url = 'http://46.101.167.163:5100/articles/details';

    let location = $('#location').val();
    let keyTerms = $('#keyTerms').val();

    let url = `${base_url}?start%20time=${endString}&end%20time=${startString}&keyterms=${keyTerms}&location=${location}`;

    fetch(proxyurl + url)
        .then((response) => response.json())
        .then(function (json) {
            // seperate data fortnightly

            date.setDate(date.getDate() + 4);
            let checkDate1 = date.toISOString().slice(0, 10);
            checkDate1 = checkDate1 + 'T00:00:00';
            date.setDate(date.getDate() + 4);
            let checkDate2 = date.toISOString().slice(0, 10);
            checkDate2 = checkDate2 + 'T00:00:00';
            date.setDate(date.getDate() + 4);
            let checkDate3 = date.toISOString().slice(0, 10);
            checkDate3 = checkDate3 + 'T00:00:00';
            date.setDate(date.getDate() + 4);
            let checkDate4 = date.toISOString().slice(0, 10);
            checkDate4 = checkDate4 + 'T00:00:00';
            date.setDate(date.getDate() + 4);
            let checkDate5 = date.toISOString().slice(0, 10);
            checkDate5 = checkDate5 + 'T00:00:00';
            date.setDate(date.getDate() + 4);
            let checkDate6 = date.toISOString().slice(0, 10);
            checkDate6 = checkDate6 + 'T00:00:00';


            let firstjson = [];
            let secondjson = [];
            let thirdjson = [];
            let fourthjson = [];
            let fifthjson = [];
            let sixthjson = [];
            let seventhjson = [];
            let dd;
            let d1 = new Date(checkDate1);
            let d2 = new Date(checkDate2);
            let d3 = new Date(checkDate3);
            let d4 = new Date(checkDate4);
            let d5 = new Date(checkDate5);
            let d6 = new Date(checkDate6);

            for (let i = 0; i < json.length; i++) {
                dd = new Date(json[i].date);

                if (dd.getTime() > d6.getTime()) {
                    seventhjson.push(json[i]);
                } else if (dd.getTime() > d5.getTime()) {
                    sixthjson.push(json[i]);
                } else if (dd.getTime() > d4.getTime()) {
                    fifthjson.push(json[i]);
                } else if (dd.getTime() > d3.getTime()) {
                    fourthjson.push(json[i]);
                } else if (dd.getTime() > d2.getTime()) {
                    thirdjson.push(json[i]);
                } else if (dd.getTime() > d1.getTime()) {
                    secondjson.push(json[i]);
                } else {
                    firstjson.push(json[i]);
                }

            }

            let firstSet = new Set();
            let secondSet = new Set();
            let thirdSet = new Set();
            let fourthSet = new Set();
            let fifthSet = new Set();
            let sixthSet = new Set();
            let seventhSet = new Set();


            for (let i = 0; i < firstjson.length; i++) {
                if (!firstSet.has(json[i].disease[0])) {
                    firstSet.add(json[i].disease[0]);
                }
            }

            for (let i = 0; i < secondjson.length; i++) {
                if (!secondSet.has(json[i].disease[0])) {
                    secondSet.add(json[i].disease[0]);
                }
            }

            for (let i = 0; i < thirdjson.length; i++) {
                if (!thirdSet.has(json[i].disease[0])) {
                    thirdSet.add(json[i].disease[0]);
                }
            }

            for (let i = 0; i < fourthjson.length; i++) {
                if (!fourthSet.has(json[i].disease[0])) {
                    fourthSet.add(json[i].disease[0]);
                }
            }

            for (let i = 0; i < fifthjson.length; i++) {
                if (!fifthSet.has(json[i].disease[0])) {
                    fifthSet.add(json[i].disease[0]);
                }
            }

            for (let i = 0; i < sixthjson.length; i++) {
                if (!sixthSet.has(json[i].disease[0])) {
                    sixthSet.add(json[i].disease[0]);
                }
            }

            for (let i = 0; i < seventhjson.length; i++) {
                if (!seventhSet.has(json[i].disease[0])) {
                    seventhSet.add(json[i].disease[0]);
                }
            }


            let firstCont = {};
            for (let item of firstSet) {
                firstCont[item] = getCount(firstjson, item);
            }

            // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
            // Create items array
            let firstItems = Object.keys(firstCont).map(function (key) {
                return [key, firstCont[key]];
            });

            let secondCont = {};
            for (let item of secondSet) {
                secondCont[item] = getCount(secondjson, item);
            }

            // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
            // Create items array
            let secondItems = Object.keys(secondCont).map(function (key) {
                return [key, secondCont[key]];
            });

            let thirdCont = {};
            for (let item of thirdSet) {
                thirdCont[item] = getCount(thirdjson, item);
            }

            // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
            // Create items array
            let thirdItems = Object.keys(thirdCont).map(function (key) {
                return [key, thirdCont[key]];
            });

            let fourthCont = {};
            for (let item of fourthSet) {
                fourthCont[item] = getCount(fourthjson, item);
            }

            // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
            // Create items array
            let fourthItems = Object.keys(fourthCont).map(function (key) {
                return [key, fourthCont[key]];
            });

            let fifthCont = {};
            for (let item of fifthSet) {
                fifthCont[item] = getCount(fifthjson, item);
            }

            // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
            // Create items array
            let fifthItems = Object.keys(fifthCont).map(function (key) {
                return [key, fifthCont[key]];
            });

            let sixthCont = {};
            for (let item of sixthSet) {
                sixthCont[item] = getCount(sixthjson, item);
            }

            // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
            // Create items array
            let sixthItems = Object.keys(sixthCont).map(function (key) {
                return [key, sixthCont[key]];
            });

            let seventhCont = {};
            for (let item of seventhSet) {
                seventhCont[item] = getCount(seventhjson, item);
            }

            // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
            // Create items array
            let seventhItems = Object.keys(seventhCont).map(function (key) {
                return [key, seventhCont[key]];
            });

            let firstDisease = [];
            let secondDisease = [];
            let thirdDisease = [];
            let fourthDisease = [];
            let fifthDisease = [];
            let sixthDisease = [];
            let seventhDisease = [];

            if((firstItems[0][0] in firstCont)){
                firstDisease.push(firstCont[firstItems[0][0]]);
            } else {
                firstDisease.push(0);
            }
            if((firstItems[0][0] in secondCont)){
                firstDisease.push(secondCont[firstItems[0][0]]);
            } else {
                firstDisease.push(0);
            }
            if((firstItems[0][0] in thirdCont)){
                firstDisease.push(thirdCont[firstItems[0][0]]);
            } else {
                firstDisease.push(0);
            }
            if((firstItems[0][0] in fourthCont)){
                firstDisease.push(fourthCont[firstItems[0][0]]);
            } else {
                firstDisease.push(0);
            }
            if((firstItems[0][0] in fifthCont)){
                firstDisease.push(fifthCont[firstItems[0][0]]);
            } else {
                firstDisease.push(0);
            }
            if((firstItems[0][0] in sixthCont)){
                firstDisease.push(sixthCont[firstItems[0][0]]);
            } else {
                firstDisease.push(0);
            }
            if((firstItems[0][0] in seventhCont)){
                firstDisease.push(seventhCont[firstItems[0][0]]);
            } else {
                firstDisease.push(0);
            }

            if((firstItems[1][0] in firstCont)){
                secondDisease.push(firstCont[firstItems[1][0]]);
            } else {
                secondDisease.push(0);
            }
            if((firstItems[1][0] in secondCont)){
                secondDisease.push(secondCont[firstItems[1][0]]);
            } else {
                secondDisease.push(0);
            }
            if((firstItems[1][0] in thirdCont)){
                secondDisease.push(thirdCont[firstItems[1][0]]);
            } else {
                secondDisease.push(0);
            }
            if((firstItems[1][0] in fourthCont)){
                secondDisease.push(fourthCont[firstItems[1][0]]);
            } else {
                secondDisease.push(0);
            }
            if((firstItems[1][0] in fifthCont)){
                secondDisease.push(fifthCont[firstItems[1][0]]);
            } else {
                secondDisease.push(0);
            }
            if((firstItems[1][0] in sixthCont)){
                secondDisease.push(sixthCont[firstItems[1][0]]);
            } else {
                secondDisease.push(0);
            }
            if((firstItems[1][0] in seventhCont)){
                secondDisease.push(seventhCont[firstItems[1][0]]);
            } else {
                secondDisease.push(0);
            }

            if((firstItems[2][0] in firstCont)){
                thirdDisease.push(firstCont[firstItems[2][0]]);
            } else {
                thirdDisease.push(0);
            }
            if((firstItems[2][0] in secondCont)){
                thirdDisease.push(secondCont[firstItems[2][0]]);
            } else {
                thirdDisease.push(0);
            }
            if((firstItems[2][0] in thirdCont)){
                thirdDisease.push(thirdCont[firstItems[2][0]]);
            } else {
                thirdDisease.push(0);
            }
            if((firstItems[2][0] in fourthCont)){
                thirdDisease.push(fourthCont[firstItems[2][0]]);
            } else {
                thirdDisease.push(0);
            }
            if((firstItems[2][0] in fifthCont)){
                thirdDisease.push(fifthCont[firstItems[2][0]]);
            } else {
                thirdDisease.push(0);
            }
            if((firstItems[2][0] in sixthCont)){
                thirdDisease.push(sixthCont[firstItems[2][0]]);
            } else {
                thirdDisease.push(0);
            }
            if((firstItems[2][0] in seventhCont)){
                thirdDisease.push(seventhCont[firstItems[2][0]]);
            } else {
                thirdDisease.push(0);
            }

            if((firstItems[3][0] in firstCont)){
                fourthDisease.push(firstCont[firstItems[3][0]]);
            } else {
                fourthDisease.push(0);
            }
            if((firstItems[3][0] in secondCont)){
                fourthDisease.push(secondCont[firstItems[3][0]]);
            } else {
                fourthDisease.push(0);
            }
            if((firstItems[3][0] in thirdCont)){
                fourthDisease.push(thirdCont[firstItems[3][0]]);
            } else {
                fourthDisease.push(0);
            }
            if((firstItems[3][0] in fourthCont)){
                fourthDisease.push(fourthCont[firstItems[3][0]]);
            } else {
                fourthDisease.push(0);
            }
            if((firstItems[3][0] in fifthCont)){
                fourthDisease.push(fifthCont[firstItems[3][0]]);
            } else {
                fourthDisease.push(0);
            }
            if((firstItems[3][0] in sixthCont)){
                fourthDisease.push(sixthCont[firstItems[3][0]]);
            } else {
                fourthDisease.push(0);
            }
            if((firstItems[3][0] in seventhCont)){
                fourthDisease.push(seventhCont[firstItems[3][0]]);
            } else {
                fourthDisease.push(0);
            }

            if((firstItems[4][0] in firstCont)){
                fifthDisease.push(firstCont[firstItems[4][0]]);
            } else {
                fifthDisease.push(0);
            }
            if((firstItems[4][0] in secondCont)){
                fifthDisease.push(secondCont[firstItems[4][0]]);
            } else {
                fifthDisease.push(0);
            }
            if((firstItems[4][0] in thirdCont)){
                fifthDisease.push(thirdCont[firstItems[4][0]]);
            } else {
                fifthDisease.push(0);
            }
            if((firstItems[4][0] in fourthCont)){
                fifthDisease.push(fourthCont[firstItems[4][0]]);
            } else {
                fifthDisease.push(0);
            }
            if((firstItems[4][0] in fifthCont)){
                fifthDisease.push(fifthCont[firstItems[4][0]]);
            } else {
                fifthDisease.push(0);
            }
            if((firstItems[4][0] in sixthCont)){
                fifthDisease.push(sixthCont[firstItems[4][0]]);
            } else {
                fifthDisease.push(0);
            }
            if((firstItems[4][0] in seventhCont)){
                fifthDisease.push(seventhCont[firstItems[4][0]]);
            } else {
                fifthDisease.push(0);
            }

            if((firstItems[5][0] in firstCont)){
                sixthDisease.push(firstCont[firstItems[5][0]]);
            } else {
                sixthDisease.push(0);
            }
            if((firstItems[5][0] in secondCont)){
                sixthDisease.push(secondCont[firstItems[5][0]]);
            } else {
                sixthDisease.push(0);
            }
            if((firstItems[5][0] in thirdCont)){
                sixthDisease.push(thirdCont[firstItems[5][0]]);
            } else {
                sixthDisease.push(0);
            }
            if((firstItems[5][0] in fourthCont)){
                sixthDisease.push(fourthCont[firstItems[5][0]]);
            } else {
                sixthDisease.push(0);
            }
            if((firstItems[5][0] in fifthCont)){
                sixthDisease.push(fifthCont[firstItems[5][0]]);
            } else {
                sixthDisease.push(0);
            }
            if((firstItems[5][0] in sixthCont)){
                sixthDisease.push(sixthCont[firstItems[5][0]]);
            } else {
                sixthDisease.push(0);
            }
            if((firstItems[5][0] in seventhCont)){
                sixthDisease.push(seventhCont[firstItems[5][0]]);
            } else {
                sixthDisease.push(0);
            }

            if((firstItems[6][0] in firstCont)){
                seventhDisease.push(firstCont[firstItems[6][0]]);
            } else {
                seventhDisease.push(0);
            }
            if((firstItems[6][0] in secondCont)){
                seventhDisease.push(secondCont[firstItems[6][0]]);
            } else {
                seventhDisease.push(0);
            }
            if((firstItems[6][0] in thirdCont)){
                seventhDisease.push(thirdCont[firstItems[6][0]]);
            } else {
                seventhDisease.push(0);
            }
            if((firstItems[6][0] in fourthCont)){
                seventhDisease.push(fourthCont[firstItems[6][0]]);
            } else {
                seventhDisease.push(0);
            }
            if((firstItems[6][0] in fifthCont)){
                seventhDisease.push(fifthCont[firstItems[6][0]]);
            } else {
                seventhDisease.push(0);
            }
            if((firstItems[6][0] in sixthCont)){
                seventhDisease.push(sixthCont[firstItems[6][0]]);
            } else {
                seventhDisease.push(0);
            }
            if((firstItems[6][0] in seventhCont)){
                seventhDisease.push(seventhCont[firstItems[6][0]]);
            } else {
                seventhDisease.push(0);
            }

            (function ($) {
              $(document).ready(function () {

                //
                //  Line Graph
                //
                //var total = 0;
                //for (let i = 0; i < allItems.length; i++){
                //  total=total+allItems[i][1];
                //}
                // Data
                //var res1 = allItems[0][0].substring(0,20);
                //var res2 = allItems[1][0].substring(0,20);




                var ubdData = {
                  datasets: [{
                      label: firstItems[0][0],
                      fill: false,
                      lineTension: 0.1,
                      //backgroundColor: "rgba(225,0,0,0.4)",
                      borderColor: "red", // The main line color
                      borderCapStyle: 'square',
                      borderDash: [], // try [5, 15] for instance
                      borderDashOffset: 0.0,
                      borderJoinStyle: 'miter',
                      pointBorderColor: "white",
                      pointBackgroundColor: "black",
                      pointBorderWidth: 1,
                      pointHoverRadius: 8,
                      pointHoverBackgroundColor: "red",
                      pointHoverBorderColor: "black",
                      pointHoverBorderWidth: 2,
                      pointRadius: 4,
                      pointHitRadius: 10,
                      // notice the gap in the data and the spanGaps: true
                      data: [firstDisease[0],firstDisease[1],firstDisease[2],firstDisease[3],firstDisease[4],firstDisease[5],firstDisease[6]],
                      spanGaps: true,
                    }, {
                      label: firstItems[1][0],
                      fill: false,
                      lineTension: 0.1,
                      //backgroundColor: "rgba(225,0,0,0.4)",
                      borderColor: "rgb(167, 105, 0)",
                      borderCapStyle: 'butt',
                      borderDash: [],
                      borderDashOffset: 0.0,
                      borderJoinStyle: 'miter',
                      pointBorderColor: "white",
                      pointBackgroundColor: "black",
                      pointBorderWidth: 1,
                      pointHoverRadius: 8,
                      pointHoverBackgroundColor: "rgb(167, 105, 0)",
                      pointHoverBorderColor: "black",
                      pointHoverBorderWidth: 2,
                      pointRadius: 4,
                      pointHitRadius: 10,
                      // notice the gap in the data and the spanGaps: false
                      data: [secondDisease[0],secondDisease[1],secondDisease[2],secondDisease[3],secondDisease[4],secondDisease[5],secondDisease[6]],
                      spanGaps: true,
                    }, {
                      label: firstItems[2][0],
                      fill: false,
                      lineTension: 0.1,
                      //backgroundColor: "rgba(225,0,0,0.4)",
                      borderColor: "blue",
                      borderCapStyle: 'butt',
                      borderDash: [],
                      borderDashOffset: 0.0,
                      borderJoinStyle: 'miter',
                      pointBorderColor: "white",
                      pointBackgroundColor: "black",
                      pointBorderWidth: 1,
                      pointHoverRadius: 8,
                      pointHoverBackgroundColor: "blue",
                      pointHoverBorderColor: "black",
                      pointHoverBorderWidth: 2,
                      pointRadius: 4,
                      pointHitRadius: 10,
                      // notice the gap in the data and the spanGaps: false
                      data: [thirdDisease[0],thirdDisease[1],thirdDisease[2],thirdDisease[3],thirdDisease[4],thirdDisease[5],thirdDisease[6]],
                      spanGaps: true,
                    }, {
                      label: firstItems[3][0],
                      fill: false,
                      lineTension: 0.1,
                      //backgroundColor: "rgba(225,0,0,0.4)",
                      borderColor: "black",
                      borderCapStyle: 'butt',
                      borderDash: [],
                      borderDashOffset: 0.0,
                      borderJoinStyle: 'miter',
                      pointBorderColor: "white",
                      pointBackgroundColor: "black",
                      pointBorderWidth: 1,
                      pointHoverRadius: 8,
                      pointHoverBackgroundColor: "black",
                      pointHoverBorderColor: "black",
                      pointHoverBorderWidth: 2,
                      pointRadius: 4,
                      pointHitRadius: 10,
                      // notice the gap in the data and the spanGaps: false
                      data: [fourthDisease[0],fourthDisease[1],fourthDisease[2],fourthDisease[3],fourthDisease[4],fourthDisease[5],fourthDisease[6]],
                      spanGaps: true,
                    }, {
                      label: firstItems[4][0],
                      fill: false,
                      lineTension: 0.1,
                      //backgroundColor: "rgba(225,0,0,0.4)",
                      borderColor: "green",
                      borderCapStyle: 'butt',
                      borderDash: [],
                      borderDashOffset: 0.0,
                      borderJoinStyle: 'miter',
                      pointBorderColor: "white",
                      pointBackgroundColor: "black",
                      pointBorderWidth: 1,
                      pointHoverRadius: 8,
                      pointHoverBackgroundColor: "green",
                      pointHoverBorderColor: "black",
                      pointHoverBorderWidth: 2,
                      pointRadius: 4,
                      pointHitRadius: 10,
                      // notice the gap in the data and the spanGaps: false
                      data: [fifthDisease[0],fifthDisease[1],fifthDisease[2],fifthDisease[3],fifthDisease[4],fifthDisease[5],fifthDisease[6]],
                      spanGaps: true,
                    }, {
                      label: firstItems[5][0],
                      fill: false,
                      lineTension: 0.1,
                      //backgroundColor: "rgba(225,0,0,0.4)",
                      borderColor: "orange",
                      borderCapStyle: 'butt',
                      borderDash: [],
                      borderDashOffset: 0.0,
                      borderJoinStyle: 'miter',
                      pointBorderColor: "white",
                      pointBackgroundColor: "black",
                      pointBorderWidth: 1,
                      pointHoverRadius: 8,
                      pointHoverBackgroundColor: "orange",
                      pointHoverBorderColor: "black",
                      pointHoverBorderWidth: 2,
                      pointRadius: 4,
                      pointHitRadius: 10,
                      // notice the gap in the data and the spanGaps: false
                      data: [sixthDisease[0],sixthDisease[1],sixthDisease[2],sixthDisease[3],sixthDisease[4],sixthDisease[5],sixthDisease[6]],
                      spanGaps: true,
                    }, {
                      label: firstItems[6][0],
                      fill: false,
                      lineTension: 0.1,
                      //backgroundColor: "rgba(225,0,0,0.4)",
                      borderColor: "purple",
                      borderCapStyle: 'butt',
                      borderDash: [],
                      borderDashOffset: 0.0,
                      borderJoinStyle: 'miter',
                      pointBorderColor: "white",
                      pointBackgroundColor: "black",
                      pointBorderWidth: 1,
                      pointHoverRadius: 8,
                      pointHoverBackgroundColor: "purple",
                      pointHoverBorderColor: "black",
                      pointHoverBorderWidth: 2,
                      pointRadius: 4,
                      pointHitRadius: 10,
                      // notice the gap in the data and the spanGaps: false
                      data: [seventhDisease[0],seventhDisease[1],seventhDisease[2],seventhDisease[3],seventhDisease[4],seventhDisease[5],seventhDisease[6]],
                      spanGaps: true,
                    }

                  ],
                  labels: ["28/03/19-31/03/19","01/04/19-04/04/19","05/04/19-08/04/19","09/04/19-12/04/19","13/04/19-16/04/19","17/04/19-20/04/19","21/04/19-24/04/19"]
                };

                /*for(let i=0;i<firstSet.length;i++){
                     ubdCharts.data.dataset.push({
                            label: firstSet[0][0]+i,
                            fill: true,
                            lineTension: 0.2,
                            backgroundColor: "transparent",
                            borderColor: "rgba(75, 75, 75, 0.7)",
                            pointBorderColor: "rgba(75, 75, 75, 0.7)",
                            pointHoverBackgroundColor: "rgba(75, 75, 75, 0.7)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            borderWidth: 2,
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 0,
                            pointHoverRadius: 3,
                            pointHoverBorderColor: "#fff",
                            pointHoverBorderWidth: 3,
                            pointRadius: 0,
                            pointHitRadius: 5,
                            data: modalMovingAverageData[0],
                            spanGaps: false
                        });
                 }}*/

                // Options
                var ubdOptions = {
                  legend: {
                    display: false,
                    position: 'bottom',
                    labels: {
                      padding: 25,
                      boxWidth: 20
                    }
                  },
                  scales: {
                      xAxes: [{
                          ticks: {
                              autoSkip: false
                          }
                      }],
                      yAxes: [{
                          ticks: {
                              beginAtZero: true,
                              stepSize: 1,
                              min: 0
                          }
                      }]
                  },
                  cutoutPercentage: 0,
                  // Uncomment the following line in order to disable the animations.
                  // animation: false,
                  tooltips: {
                    custom: false,
                    mode: 'index',
                    position: 'nearest'
                  }
                };
                if(window.ubdCharts != null)
                {
                    window.ubdCharts.destroy();
                }
                var ubdCt = document.getElementsByClassName('disease-line')[0];

                // Generate the users by device chart.
                window.ubdCharts = new Chart(ubdCt, {
                  type: 'line',
                  data: ubdData,
                  options: ubdOptions,
                });

              });
            })(jQuery);




        });
}
