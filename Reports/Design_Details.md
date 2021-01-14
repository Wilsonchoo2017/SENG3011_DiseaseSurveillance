#### Change log

1.1 30/03/2019:
  - Added details about our usage with Apache2
  - Updated API Specification which no longer has nested endpoints. Two new get calls are added for retrieving API logs and more details about the report in a simplified structure for ease of access.
  - Architecture Diagram is updated
  - Added discussion of our changes and challenges
      - Challenges include: scraping dynamic data, API implementation and testing
      - Docker is no longer used
      - Our deployment environment
      - How database is updated



# Design Details

## Software Project Management

In order to better manage our team collaboration and prevent too many problems when integrating parts of our software together. We have defined a 4-step procedure to "deploy" components of our software to the master branch of our repository. This procedure is not explicitly stated/reflected on our timeline above but it will be conducted informally on a regular basis whilst we are each working on our software components.


<table>
  <tr>
   <td>Step
   </td>
   <td>Environment
   </td>
   <td>Description
   </td>
  </tr>
  <tr>
   <td>1
   </td>
   <td>Development
   </td>
   <td>Developer will develop independently in their local workstation/workspace. Each developer will have a copy of the latest version of the source code. In this stage, basic unit testing might be done by the developer themselves. 
   </td>
  </tr>
  <tr>
   <td>2
   </td>
   <td>Integration
   </td>
   <td>Developer integrates their work with others via GitHub repository. All developer can look at each other's work at anytime and request for their code. 
   </td>
  </tr>
  <tr>
   <td>3
   </td>
   <td>Testing
   </td>
   <td>An assigned tester checks and test new code by performing automated script testing or interface testing. 
   </td>
  </tr>
  <tr>
   <td>4
   </td>
   <td>Deployment
   </td>
   <td>Changes that are approved from testing stage will be deployed.
   </td>
  </tr>
</table>


Some improvements to our current deployment procedure would be integrating with third-party softwares to improve our integration and deployment procedures at a more efficient rate. Third-party softwares such as NOW by Zeit allows an automatic deployment on every push and pull requests and Koding allows for quick management of deployment. 

However, after a some discussion with the team, we believe that although these are very valuable tools for large projects but with the time and scale of our project, the team feels that these additions would not be necessary and could potentially become a risk and cause more problems as no one in the team has had experiences in using them.


# How We Intend to: 


## Develop the API Module

In terms of design, after going through the project specification and doing some planning, our team has drafted a basic specification for our API (see section below). 


There were two API designs for our code implementation that our team had come up with. We have been contemplating on which one to implement and have finally decided a design (see later). 
Both designs have its own benefits;

**<span style="text-decoration:underline;">Design 1</span>** separates the GET calls into 4 nested GET calls where the first GET call (article) will send a GET call to the second (reports). The second GET call will call the third GET call (eventreports) and so on. Each will return its own JSON object.

**Pros:** Design 1 allows the team to easily split the work between the members with a very strictly defined structure which avoids clashes and miscommunication. 

**Cons**: Design 1 can be over-complicated as ultimately the user only needs one GET call to retrieve the data they would need. It would also be confusing as multiple endpoints/GET calls are exposed to the user despite the only GET call that they will be and can use will be the article GET call. This can be quite confusing for the user of our API. 

**<span style="text-decoration:underline;">Design 2.</span>** Implements only one GET call with methods in the code that simply provides data to create this one big JSON object.

**Pros:** Design 2  is less abstract as it simplifies the logic where there is only one large JSON object to think about. 

**Cons:** Design 2 is very ambiguous and difficult as to how the work would be split between the members in the team if it was simply decided to be this way. It could potentially lead to a lot of repeated work and miscommunication if it was not further defined to be clearer.  \
Furthermore there is less freedom and will be very difficult to make adjustments to the code later on.

So rather than having multiple endpoints and using Design 1. We have decided Design 2 using one endpoint/GET but, to implement it using the nesting methodology in Design 1, and replace 3 endpoints, (namely Report, Event Report and location) with 3 different function. These functions make work delegation easier and ensure work is not repeated.

In terms of implementation, the steps we would take to set up to start implementing our API include the following:



1. Install Python3
2. Install Pip3
3. Use pip3 to install Flask, Flask-Restplus
4. Follow the API specification (specified below) to create a RESTful API, including:
    *   Writing methods
    *   Creating an endpoint
    *   Documenting the API


## Provide the Ability to Run it in Web Service Mode

We intend to use Python Flask-RESTplus to develop our API module and we will be hosting our API module on a hosting platform called Digital Ocean (Cloud-based server).
*Please refer to Implementation Details (For API) -> Development and Deployment Environment section below for more details about how we have provided the ability for our API to run in Web Service Mode and justifications to our decisions.


# API Specification 

## Current Version
After some evaluation of the usefulness of our previous designs from the perspective of an user, this is our current implementation of the API.
<table>
  <tr>
   <td><strong>HTTP method</strong>
   </td>
   <td><strong>Path</strong>
   </td>
   <td><strong>Parameters</strong>
   </td>
   <td><strong>Response</strong>
   </td>
   <td><strong>Auth</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td colspan="6" >GET Call for the Users of API
   </td>
  </tr>
  <tr>
   <td>Get
   </td>
   <td>/articles
   </td>
   <td>start time,
<p>
end time,
<p>
keyterms,
<p>
location
   </td>
   <td>JSON Responses
   </td>
   <td>No
   </td>
   <td>User will call this HTTP method. Called by user.
   </td>
  </tr>
  <tr>
  
  </tr>
  <tr>
   <td>Get
   </td>
   <td>/articles/logs
   </td>
   <td>N/A
   </td>
   <td>JSON Responses
   </td>
   <td>No
   </td>
   <td>User will call this HTTP method. Called by user.
   </td>
  </tr>
  <tr>
   <td>Get
   </td>
   <td>/articles/details
   </td>
   <td>N/A
   </td>
   <td>JSON Responses
   </td>
   <td>No
   </td>
   <td>User will call this HTTP method. Called by user.
   </td>
  </tr>
 
</table>

### Get /articles/ 


#### Description 

The articles endpoint will be the main endpoint that users call. It will return a large json string containing information which will be specified below. 


#### Input 

Example Request:(Not active)
http://127.0.0.1:5100/articles/?start%20time=2009-01-17T22%3A41%3A00&end%20time=2019-03-30T22%3A41%3A00&keyterms=swine&location=india


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Object Type</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>StartTime*
   </td>
   <td>Datetime Object
   </td>
   <td>The starting date, all reports will be after this date
   </td>
  </tr>
  <tr>
   <td>EndTime*
   </td>
   <td>Datetime Object
   </td>
   <td>The ending date, all reports will be before this date
   </td>
  </tr>
  <tr>
   <td>KeyTerms
   </td>
   <td>String
   </td>
   <td>The key terms to be searched
   </td>
  </tr>
  <tr>
   <td>Location*
   </td>
   <td>String
   </td>
   <td>Country of the outbreak/report
   </td>
  </tr>
</table>



#### Output 


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Object Type</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>URL
   </td>
   <td>String
   </td>
   <td>Webpage this information is from
   </td>
  </tr>
  <tr>
   <td>Date of publication
   </td>
   <td>String
   </td>
   <td>Date in which webpage was published
   </td>
  </tr>
  <tr>
   <td>Headline
   </td>
   <td>String
   </td>
   <td>Title of webpage
   </td>
  </tr>
  <tr>
   <td>Main Text
   </td>
   <td>String
   </td>
   <td>Text found in webpage
   </td>
  </tr>
  <tr>
   <td>Report
   </td>
   <td>Report Object
   </td>
   <td>List of report objects
   </td>
  </tr>
</table>


E.g.


```
[
   {
     "url": "<string>",
     "date_of_publication": "<string::date>",
     "headline": "<string>",
     "main_text": "<string>",
     "reports": "[<object::report>]"
   }
]
```
**NOTE: A list of article objects that match the user's input will be returned to the user

### Get /articles/logs/


#### Description 

The articles/logs endpoint will be a supplementary endpoint that users call. It will return a large json string containing information which will be specified below. 


#### Input 

Example Request:(Not active)
http://127.0.0.1:5100/articles/logs
 No input parameters are required to make this call.



#### Output 


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Object Type</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>Logs
   </td>
   <td>String
   </td>
   <td>The content of the logfile as a string for data about users who have accessed this API in history.
   </td>
</table>


E.g.


```
{
     "logs": "Global Incident Map : Team SoftwareEngines, Accessed Time: 2019-04-01 14:34:01 GET SUCCESS 2019-02-20 00:18:00 to 2019-03-30 22:41:00 Location Taiwan\nKey terms [fever]\n\n"
}
```
### Get /articles/details


#### Description 

The articles/details endpoint will be another endpoint that users call. It will return a large json string containing information which will be specified below. 

The difference between the articles endpoint and this endpoint is that this endpoint allows the location input parameter to be optional and returns some extra information such as a more details url, longitude and lattitude of reported locations. 

*The need for an endpoint like this resulted from assessing its usefulness from a user's perspective.

#### Input 

Example Request:(Not active)
http://127.0.0.1:5100/articles/?start%20time=2009-01-17T22%3A41%3A00&end%20time=2019-03-30T22%3A41%3A00&keyterms=swine&location=india


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Object Type</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>StartTime*
   </td>
   <td>Datetime Object
   </td>
   <td>The starting date, all reports will be after this date
   </td>
  </tr>
  <tr>
   <td>EndTime*
   </td>
   <td>Datetime Object
   </td>
   <td>The ending date, all reports will be before this date
   </td>
  </tr>
  <tr>
   <td>KeyTerms
   </td>
   <td>String
   </td>
   <td>The key terms to be searched
   </td>
  </tr>
  <tr>
   <td>Location
   </td>
   <td>String
   </td>
   <td>Country of the outbreak/report
   </td>
  </tr>
</table>



#### Output 


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Object Type</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>URL
   </td>
   <td>String
   </td>
   <td>Webpage this information is from
   </td>
  </tr>
  <td>Details URL
   </td>
   <td>String
   </td>
   <td>Another link that gives more information about this report
   </td>
  </tr>
  <tr>
   <td>Date of publication
   </td>
   <td>String
   </td>
   <td>Date in which webpage was published
   </td>
  </tr>
  <tr>
   <td>Headline
   </td>
   <td>String
   </td>
   <td>Title of webpage
   </td>
  </tr>
  <tr>
   <td>Main Text
   </td>
   <td>String
   </td>
   <td>Text found in webpage
   </td>
  </tr>
  <tr>
   <td>Disease
   </td>
   <td>String
   </td>
   <td>List of Strings of disease(s) involved in the article
   </td>
  </tr>
  
  <tr>
   <td>Syndrome
   </td>
   <td>String
   </td>
   <td>List of Strings of syndrome(s) stated in the article
   </td>
  </tr>
  
  <tr>
  <td>Type
   </td>
   <td>String
   </td>
   <td>The type of event in the article (can be one of: "presence", "death", "infected", "hospitalised", "recovered"
   </td>
  </tr>
  
   <tr>
   <td>Date
   </td>
   <td>String
   </td>
   <td>Date in which the article event happened
   </td>
  </tr>
  
  <tr>
   <td>Country
   </td>
   <td>String
   </td>
   <td>Country in which the article event happened
   </td>
  </tr>
  
  <tr>
   <td>Location
   </td>
   <td>String
   </td>
   <td>City/state in which the article event happened
   </td>
  </tr>
  
  <tr>
   <td>Latitude
   </td>
   <td>Float
   </td>
   <td>Latitude of the location in which the article event happened
   </td>
  </tr>
  
  <tr>
   <td>Longitude
   </td>
   <td>Float
   </td>
   <td>Longitude of the location in which the article event happened
   </td>
  </tr>
  
  <tr>
   <td>Number Affected
   </td>
   <td>Integer
   </td>
   <td>Number of people affected by the article event
   </td>
  </tr>
  
  <tr>
   <td>Comment
   </td>
   <td>String
   </td>
   <td>Any comment in regards to the article event
   </td>
  </tr>
</table>


E.g.


```
[
  {
    "url": "<string>",
    "details_url": "<string>",
    "date_of_publication": "<string::date>",
    "headline": "<string>",
    "main_text": "<string>",
    "disease": [
      "<string::disease>"
    ],
    "syndrome": [
      "<string::syndrome>"
    ],
    "type": "<string::event-type>",
    "date": "<string::date>",
    "country": "<string>",
    "location": "<string>",
    "latitude": <float>,
    "longitude": <float>,
    "number-affected": <integer>,
    "comment": "<string>"
  }
]
```
**NOTE: A list of article details objects that match the user's input will be returned to the user

## Previous Version


<table>
  <tr>
   <td><strong>HTTP method</strong>
   </td>
   <td><strong>Path</strong>
   </td>
   <td><strong>Parameters</strong>
   </td>
   <td><strong>Response</strong>
   </td>
   <td><strong>Auth</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td colspan="6" >GET Call for the Users of API
   </td>
  </tr>
  <tr>
   <td>Get
   </td>
   <td>/articles
   </td>
   <td>StartDate,
<p>
EndDate,
<p>
keyTerms,
<p>
Location
   </td>
   <td>JSON Responses
   </td>
   <td>No
   </td>
   <td>User will call this HTTP method. Called by user
   </td>
  </tr>
  <tr>
   <td colspan="6" >Nested GET Calls from Our Previous API Design (Will not be implemented)*
   </td>
  </tr>
  <tr>
   <td>Get
   </td>
   <td>/Report/{id}
   </td>
   <td>N/A
   </td>
   <td>JSON Responses
   </td>
   <td>No
   </td>
   <td>Support method. Retrieves report object. Not called by user
   </td>
  </tr>
  <tr>
   <td>Get
   </td>
   <td>/EventReport/{id}
   </td>
   <td>N/A
   </td>
   <td>JSON Responses
   </td>
   <td>No
   </td>
   <td>Support method. Retrieves event report. Not called by user
   </td>
  </tr>
  <tr>
   <td>Get
   </td>
   <td>/Location/{id}
   </td>
   <td>N/A
   </td>
   <td>JSON Responses
   </td>
   <td>No
   </td>
   <td>Support method. Retrieves location object. Not called by user
   </td>
  </tr>
</table>


*NOTE: These endpoints will not be implemented and nesting will be completed within the code hidden from the user. They are described here to demonstrate our thought process and our original API design which had all 4 GET calls in the above table.


### Get /Article/ 


#### Description 

The article endpoint will be the main endpoint that users call. It will return a large json string containing information which will be specified below. 

Our original design was that the article endpoint will call /Reports/{id} to obtain a list of reports and then grab all other output parameters stated below but for our latest design, rather than calling /Reports/{id}, it will call an internal method (not exposed to the API user) which will perform the same functionality.


#### Input 

Example Request:(Not active)

[http://127.0.0.1:5100/article/?start%20time=2018-02-17T22%3A41%3A00&end%20time=2018-03-17T22%3A41%3A00&keyterms=Children%2C%20Property%2C%20Tax&location=Australia%22](http://127.0.0.1:5100/article/?start%20time=2018-02-17T22%3A41%3A00&end%20time=2018-03-17T22%3A41%3A00&keyterms=Children%2C%20Property%2C%20Tax&location=Australia%22) 


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Object Type</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>StartDate*
   </td>
   <td>Datetime Object
   </td>
   <td>The starting date, all reports will be after this date
   </td>
  </tr>
  <tr>
   <td>EndDate*
   </td>
   <td>Datetime Object
   </td>
   <td>The ending date, all reports will be before this date
   </td>
  </tr>
  <tr>
   <td>KeyTerms
   </td>
   <td>String
   </td>
   <td>The key terms to be searched
   </td>
  </tr>
  <tr>
   <td>Location*
   </td>
   <td>String
   </td>
   <td>Country of the outbreak/report
   </td>
  </tr>
</table>



#### Output 


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Object Type</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>URL
   </td>
   <td>String
   </td>
   <td>Webpage this information is from
   </td>
  </tr>
  <tr>
   <td>Date of publication
   </td>
   <td>String
   </td>
   <td>Date in which webpage was published
   </td>
  </tr>
  <tr>
   <td>Headline
   </td>
   <td>String
   </td>
   <td>Title of webpage
   </td>
  </tr>
  <tr>
   <td>Main Text
   </td>
   <td>String
   </td>
   <td>Text found in webpage
   </td>
  </tr>
  <tr>
   <td>Report
   </td>
   <td>Report Object
   </td>
   <td>List of report objects
   </td>
  </tr>
</table>


E.g.


```
[
   {
     "url": "<string>,",
     "date_of_publication": "<string::date>,",
     "headline": "<string>,",
     "main_text": "<string>,",
     "reports": "[<object::report>]"
   }
]
```
**NOTE: A list of article objects that match the user's input will be returned to the user


### Get /Report/{id} 


#### Description 

The report endpoint will return to the user the disease(s), syndrome(s), any extra comments and reported events (this). This endpoint will call the /EventReport/{id} endpoint to obtain a list of reported events in which it will return to the caller.


#### Input 

Example Request:(Not active)

[http://127.0.0.1:5100/report/142351](http://127.0.0.1:5100/report/142351) 


#### Output 


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Object Type</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>Disease
   </td>
   <td>String
   </td>
   <td>Name of disease
   </td>
  </tr>
  <tr>
   <td>Syndrome
   </td>
   <td>String
   </td>
   <td>Name of syndrome
   </td>
  </tr>
  <tr>
   <td>Report Event
   </td>
   <td>Evert Report Object
   </td>
   <td>List of reported events
   </td>
  </tr>
  <tr>
   <td>Comment
   </td>
   <td>String
   </td>
   <td>Any further information
   </td>
  </tr>
</table>


This will output a location object which will be used and called by the /reports/{id} endpoint.

Consisting of a list of diseases, list of syndromes, a reported_events object (obtained by calling /Event/{id} endpoint) and comments

E.g.


```
[
  {
    "disease": " [<string::disease>]",
    "syndrome": " [<string::syndrome>]",
    "reported_events": " [<object::event-report>]",
    "Comment": "<string>"
  }
]
```



### Get /EventReport/{id}


#### Description

The events report endpoint returns a list of event reports objects which contains output parameter stated below. The location of the event report will be obtained by calling the /location/{id} endpoint.


#### Input {#input}

Example Request: (Not active)

[http://127.0.0.1:5100/eventReport/132412](http://127.0.0.1:5100/eventReport/132412) 


#### Output 


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Object Type</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>Type
   </td>
   <td>String
   </td>
   <td>List of type of events
   </td>
  </tr>
  <tr>
   <td>Date
   </td>
   <td>String
   </td>
   <td>Date event occured
   </td>
  </tr>
  <tr>
   <td>Location
   </td>
   <td>Location object
   </td>
   <td>Location event occured
   </td>
  </tr>
  <tr>
   <td>Number affect 
   </td>
   <td>Integer
   </td>
   <td>Number of people affected by event
   </td>
  </tr>
</table>


E.g.


```
[
  {
    "type": "<string::event-type>",
    "date": "<string::date>",
    "location": ["<object::location>"],
    "number-affected": "<number>"
  }
]
```



### Get /Location/{id} 


#### Description 

The location endpoint takes in an id and returns the country and location associated with the id.


#### Input 

Example Request:(Not active)

[http://127.0.0.1:5100/location/14231](http://127.0.0.1:5100/location/14231) 


#### Output 


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Object Type</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>Country
   </td>
   <td>String
   </td>
   <td>Name of country
   </td>
  </tr>
  <tr>
   <td>Location
   </td>
   <td>String
   </td>
   <td>Name of city/town
   </td>
  </tr>
</table>


E.g.


```
[
  {
    "country": "<string>",
    "location": "<string>"
  }
]
```






*All data types specified in the above API design (E.g. ["<object::location>"]) comes from  and are defined in the released Project Specification.


# Implementation Details (For API) 


## Overview of Final Architecture 
For Stage 1 of our project, our API structure design follows the structure specified in the Project Specification: 


![](https://i.imgur.com/fZtQZYR.png)

The following diagram provides an overview of our entire project (both Stage 1 and Stage 2), what components/modules there are to be completed and the tools used to complete each component.

![](https://i.imgur.com/4XlSMYk.png)


Majority of our stack have been decided based on the idea of efficiency and small learning hurdle as there are only 10 weeks to complete the entire project so we are very short on time to produce quality software.  \
Besides this, the team agreed that the integration of different components individuals and sub-teams will be working on could potentially have a lot of work/issues that need to be resolved, so we decided against using tools that we are too unfamiliar with to prevent unnecessary stress under the tight schedule of trimesters.  \
Ideally if time was not a constraint, there are many new tools we would like to learn to use and experiment with.


## Database

Database: SQLite

The team has chosen to use SQLite for our database due to a number of reasons:



1. Many of our team members have previously had experience in using SQLite. This reduces the time taken to learn how to utilise a new tool so that we can focus on more major components of the project such as the API module itself with the short amount of time we have on our project.
2. SQLite is simple and lightweight which perfectly suits the purpose of our project where there is not too much variation in the data and the structure of data.
3. SQLite structures data using tables which is very convenient especially for our team and the data source we are scraping information from (Global Incident Map). Global Incident Map itself displays data in a table format so the process of retrieving the data from the table in Global Incident Map and placing it into our database tables will be straightforward. To easily provide the API with a suitable JSON format, the database schema will mimic the JSON formats we provide to the users of our API (as specified in the Project Specifications).

Our team considered NoSQL databases such a MongoDB which can provide a very flexible and dynamic structure with data stored like JSON-format documents. This could potentially make it easier for the team to process and provide the data to users of our API as what we require to return in our API are JSON formats. However, it may potentially complicate the web scraping and storing of data from Global Incident Map. On top of this, most of our team members have never had experiences in NoSQL databases so this could be a very steep learning curve that could take up a lot of our team. Hence our team decided on SQLite as our database.


## Language and Library 

Language & library usage: Python, Beautiful Soup

Due to the flexibility and our team's familiarity with Python, our team has decided to use this language to implement our API module. This will reduce our learning curve by removing the time taken to learn a new language especially when most of the team already has a steep learning curve about the structure of an API. 

Furthermore, due to Python's popularity, there are a lot of easily-accessible resources online which would greatly assist us in creating our API. 

Other languages our team members are somewhat familiar with such as Java and Javascript are possible options. Java is a typed-language and not dynamic like Python which could potentially create more hurdles for us than necessary if we were to use it. Javascript is a very powerful and flexible language with most members being experienced in it. However, because in our team, we have one member who is experience with developing APIs in Python, we have decided to use Python to effectively utilise every team members' knowledge and skills sets.

For web scraping data from our data source, some of our team members have had experience in web scraping with Python Beautiful Soup. Others have had some experience in web scraping with Perl. To keep the process simple and efficient so that we can focus on other more significant parts of the project, we have decided to use Python Beautiful Soup.


## Framework

Framework usage: Flask-RESTplus 

As mentioned before, one of our members have had experience with Flask-RESTplus and they are comfortable using it again due to our familiarity with it. The rest of our team believes that using a framework which someone in the team is already familiar with will not only reduce the number of learning hurdles but also allow our members to comfortably learn to implement an API under the guidance of the experienced team member. 


## Development and Deployment Environment 

Development Environment: **Ubuntu 18 Linux ~~MaxOS, Windows~~

Deployment Environment: DigitalOcean ~~+ Docker~~


We will be developing in Linux, MacOS as well as Windows operating systems since our members each have different operating systems out of the three mentioned where they will be working on our software on. This would ensure that our software functions on all three most popular kinds of operating systems as if there are any issues with either of the three operating systems, the issue will be reported to the team by the team member. 

Furthermore, two main browsers that we will be using and targeting are Firefox and Chrome.

For our deployment environment, we are planning to use Digital Ocean to deploy our API ~~and Docker~~ to simplify the process of deployment. The reason why we came across Digital Ocean was due to recommendation from our mentor. Originally, our team did not consider too much into detail where we will be hosting our API as we did not understand the differences between different hosting platforms and thought that any hosting platform would be fine (e.g. HerokuApp). However, after doing some research with the team, we had realised that HerokuApp can be quite slow and that Digital Ocean is a much more powerful cloud-based server. Furthermore, Digital Ocean offers a lot of resources, documentations and a range of tutorials which will benefit anyone who is new to their platform such as our team.


Cross platform server: Apache2

**Since Apache2 is a popular HTTP server hosting and supports many server side programming language specifically Python. We have decided using Apache2 as our cross platform webserver. This layer of stack is also recommended by DigitalOcean's community and a well documented step-by-step guide of how to get things started was published on their forums.

**After testing and trying Docker's container feature, we have decided to remove Docker as our part of our architecture. The reason is Docker isn't really essential in our development. In essence, Docker is suppose to aid the collaborative work by improving the process of delivering our services and application onto the real world. However, our light weight use case of only needing a deployable server which what Digital Ocean offers, doesn't justify the need of using Docker.

## Challenges and ShortComings
### Web Scraping
One of the challenges we have been dealing with is dynamic data during web scraping. Our source website had some of its data dynamic generated using JavaScript. This caused some inconvenience to us since our script were made for statically generated data. We brought this issue up to our mentor's attention and his advice  to leave some of those data out as it can get very hard. As a result of this, some of the data would be available in our database.

### API Implementation and Testing
One of the challenges in the API implementation was integrating the API code with the database query code. To prevent too many issues during integration, we strictly defined the interface in beteen specifying details about the data type as well as the format to be returned.

Another issue that arose in regards to the API was during the process of testing. Test cases that were written for black box testing for the API expected different outputs to what the implementation of the API was producing. Rather than this being an issue of the API not producing the correct output, it was more of an issue of miscommunication as we did not strictly define what kind of response different types of behaviour should elicit, what was acceptable and what was not acceptable. This problem led us to having to adjust accordingly our test cases as well as our API code to align the expectations for the outputs and behaviours later on.




## Appendix 


<table>
  <tr>
   <td><strong>Phrase</strong>
   </td>
   <td><strong>Definition</strong>
   </td>
  </tr>
  <tr>
   <td>Datetime Object
   </td>
   <td>yyyy-mm-ddThh:mm:ss
   </td>
  </tr>
</table>
