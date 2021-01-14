// change this when you integrate with the real API, or when u start using the dev server
const proxyurl = "https://cors-anywhere.herokuapp.com/"
const API_URL = 'http://localhost:5100/articles/details'
// var sessionToken = "";

const getJSON = (path, options) => 
	//console.log("fetching from" , path)
	fetch(path, options)
	.then(res => res.json())
	.catch(err => console.warn(`API_ERROR: ${err.message}`));



/**
 * This is a sample class API which you may base your code on.
 * You don't have to do this as a class.
 */
 export default class API {

	/**
	 * Defaults to teh API URL
	 * @param {string} url 
	 */
	 constructor(url = API_URL) {
		this.url = url;
	} 

	makeAPIRequest(path, options) {
		return getJSON(`${this.url}/${path}`, options);
	}

	/**
	* @returns a list of article details objects in json format
	*/

	async getArticlesDetails(startTime, endTime, location, keyTerms) {
		console.log("Getting Article Details..")
		//var tokenObj = { "username" : inputUsername, "password" : inputPassword };
		//console.log("Preparing obj: ", tokenObj);

		var options =  {
			"method": 'GET',
			"headers": {
				"Accept" : "application/json",
				"Content-Type" : "application/json"

			},
			"start time": startTime,
			"end time": endTime,
		}

		console.log("returning!");
		//let output = await fetch(proxyurl+API_URL+"?start%20time=2019-01-17T22%3A41%3A00&end%20time=2019-03-17T22%3A41%3A00&location=india", "Origin"/*options*/)
		let output = await fetch(API_URL+"?start%20time=2019-01-17T22%3A41%3A00&end%20time=2019-03-17T22%3A41%3A00&location=india", {
  mode: 'no-cors' // 'cors' by default
})
		console.log("returned output: ",output)
		return output;
		//return this.makeAPIRequest('feed.json');
	}

	test(){
		console.log("in api test")
	}

}