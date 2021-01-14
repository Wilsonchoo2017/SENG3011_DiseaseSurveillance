
// This file contains a function which helps to make an API request to the API
// This code is based off code from COMP2041 18S2 assignment given code

const proxyurl = "https://cors-anywhere.herokuapp.com/"
const base_url = "http://46.101.167.163:5100/articles/details"//'http://localhost:5100/articles/details'

const getJSON = (path, options) =>
	fetch(path, options)
	.then(res => res.json())
	.catch(err => console.warn(`API_ERROR: ${err.message}`));

// API class
 export default class API {

	/**
	 * Defaults to the API URL
	 * @param {string} url
	 */
	constructor(url = base_url) {
		this.url = url;
	}

	makeAPIRequest(path, options) {
		return getJSON(`${this.url}/${path}`, options);
	}

	/**
	* @returns a list of article details objects in json format
	*/

	async getArticlesDetails(startTime, endTime, location, keyTerms) {

		let output = await fetch(`${proxyurl}${base_url}?start%20time=${startTime}&end%20time=${endTime}&keyterms=${keyTerms}&location=${location}`)
		return output.json()
	}

}