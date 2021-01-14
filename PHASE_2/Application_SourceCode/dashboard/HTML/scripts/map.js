import API from './api.js';
const api  = new API(); 
const API_URL = 'http://localhost:5100/articles/details'

submitData()

async function submitData() {
    let startTime = "2019-01-17T22:41:00"
    let endTime = "2019-03-17T22:41:00"
    let location = "india"
    let keyTerms = []

    let start = "2019-01-17T22:41:00"
    let end = "2019-03-17T22:41:00"

   /* start = escape(start)
    end = escape(end)
    start = start.replace('.000Z', '')
    end = end.replace('.000Z', '')*/
    keyTerms = []//keyTerms.replace(',', '%2C')


    let base_url = 'localhost:5100/articles/';

    let url = `${base_url}?start%20time=${start}&end%20time=${end}&keyterms=${keyTerms}&location=${location}`
    await sendRequest(url)

    // url = url + '?start%20time=ff' + startTime
    // url = url + '&end%20time=' + endTime
    // url = url + '&keyterms=' + keyTerms
    // url = url + '&location=' + location

    /*let $resultsTable = $('#resultsTable');
    $resultsTable.empty();
    generateTable($resultsTable);*/

    /*location = location.replace(/\s/g,'') //remove whitespace
    locationArray = location.split(',') //get list of locations

    for(let i = 0; i < locationArray.length; i++) {
        let url = `${base_url}?start%20time=${start}&end%20time=${end}&keyterms=${keyTerms}&location=${locationArray[i]}`
        await sendRequest(url)
    }*/
}

function sendRequest(url) {
    const proxyurl = "https://cors-anywhere.herokuapp.com/";

    fetch(proxyurl + "localhost:5100/articles/?start%20time=2019-01-17T22:41:00&end%20time=2019-03-17T22:41:00&keyterms=&location=india")
    .then((response) => response.json())
    .then(function(data) {
        /*let $resultsTable = $('#resultsTable');
        if(data.length > 0) {

        } else {
            alert('No results!');
        }
        for(let i = 0; i < data.length; i++) {
            generateRow($resultsTable, data[i]);
        }
        $('#resultsTable').tablesorter().trigger('updateAll');*/
        console.log("data", data)
    }).catch(function() {

    })
}

//sendRequest(API_URL)

//main()
/*async function main() {
  console.log("in main!")
  await api.test()
  let output = await api.getArticlesDetails("2019-01-17T22:41:00", "2019-03-17T22:41:00", "india", [])
  await console.log(output)
}*/

/*fetch('http://localhost:5100/articles/details?start%20time=2019-01-17T22%3A41%3A00&end%20time=2019-03-17T22%3A41%3A00&location=india', {
  mode: 'no-cors' // 'cors' by default
})
.then(function(response) {
  // Do something with response
  console.log(response)
});
*/

/*
function sendRequest(url) {
    const proxyurl = "https://cors-anywhere.herokuapp.com/";

    fetch(proxyurl + url)
    .then((response) => response.json())
    .then(function(data) {
        let $resultsTable = $('#resultsTable');
        if(data.length > 0) {

        } else {
            alert('No results!');
        }
        for(let i = 0; i < data.length; i++) {
            generateRow($resultsTable, data[i]);
        }
        $('#resultsTable').tablesorter().trigger('updateAll');
        console.log(data)
    }).catch(function() {

    })
}
*/


console.log("in new file!")

///////
 // In the following example, markers appear when the user clicks on the map.
        // Each marker is labeled with a single alphabetical character.
        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var labelIndex = 0;

        function initialize() {
          var bangalore = { lat: 12.97, lng: 77.59 };
          var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: bangalore
          });

          // This event listener calls addMarker() when the map is clicked.
          google.maps.event.addListener(map, 'click', function(event) {
            addMarker(event.latLng, map);
          });

          // Add a marker at the center of the map.
          addMarker(bangalore, map);
        }

        // Adds a marker to the map.
        function addMarker(location, map) {
          // Add the marker at the clicked location, and add the next-available label
          // from the array of alphabetical characters.
          var marker = new google.maps.Marker({
            position: location,
            label: labels[labelIndex++ % labels.length],
            map: map
          });
        }

        google.maps.event.addDomListener(window, 'load', initialize);