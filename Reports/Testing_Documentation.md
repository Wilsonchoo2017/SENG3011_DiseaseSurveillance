# 1 Test Overview
Important Note: To run the test scripts, please ensure that the API is running in the background locally via "python3 app.py" in PHASE_1 -> API_SourceCode.

![](https://i.imgur.com/VXpPTAM.png)
The above diagram shows our test, with the width representing the number of tests at a certain stage. Our ideal situation is having more test at the base and less at the top. Meaning that, where ever possible perform unit testing, as we go up the pyramid the more time consuming the test will take to run and fix.

We aim to test our API implementation via both white box and black box testing. We split the overall testing into different modules such as functional testing, negative testing and reliability testing. 

# 2 Test Summary
Testing was conducted manually and informally throughout the implementation of our API (both black box and white box testing). 
On top of that, whilst part of the team worked on the API implementation, other parts of the team began writing black box tests for the API and finally when the API implmentation was completed, formal white box unit tests were written to test the internal implementation and the API was tested against the black box tests already written.

The following tools were used to conduct testing on our software.

Tools:
- Python3
- Python module “unittest”
- Shell Scripts to diff outputs

We used the “unittest” module from python to conduct our black box tests.  We were considering using javascript or typescript for the testing due to its vast number of open source testing modules like mocha and chai but not many group members are very familiar with javascript and there was concern that some members might not know how to deal with asynchronous functions in javascript.  Therefore, we decided to use python and “unittest” as group members have all used this to conduct tests before.

The Software Testing Life Cycle was used to come up with the various tests required.  As for the test cases themselves, they first open up input and output json files, then they send an API request using the input file and then compares the returned response with the contents stored in the output file to make sure the information is identical.

*NOTE: Testing has not been conducted on our new API call "/articles/details".

## The Blackbox Approach


### 2.1 Internal API Query function Testing (Functional Testing)
We tested a few querying functions in query.py that extract data directly from the sqlite3 database itself. The developer, Wilson Choo ensured that the output from these functions were correct. This includes the datatype and edge cases. This is specificed by Tammy Zhong. 


**Additional Comments:** In our early iteration, the function was not returning the right output when no data was returned, thus failing some of the tests. The specification wanted the output of such a scenario to be an empty list. The function was fixed after that. Another test case failed due to the function being case sensitive. This has since been fixed as well.


### 2.2 API Testing (Functional Testing)
We conducted tests that were written to test the two possible outcomes when sending a GET request, a code of 200, and a code of 400. If a code of 200 was received, that meant the API was able to return valid JSON data, while a code of 400 meant the request was invalid. There were tests run where we expected to receive a 200 code, where the request was valid. We also tested whether any returned data was correct by comparing them with an expected outcome to ensure that the API was accessing the correct data based on the request parameters
### 2.3 API Testing (Negative Testing)
We also conducted negative testing, where invalid parameter data was sent in GET requests to the API. This included using different date formats, random strings, absence of some parameters, non-existent parameters, and absence of all parameters. In all cases, an error message in JSON with a field specifying the types of errors was returned.
### 2.4 Api Testing (Reliability Testing)
The reliability of the API was tested by running the same tests many times and checking that the results were all the same. In this way, we knew that the API was not receiving its data arbitrarily.
### 2.5 Api Testing (Load Testing)
For load testing, we made many API requests at the same time, and checked whether or not there was any noticeable delay to see if the server was able to handle large amounts of traffic.

## The Whitebox Approach
### 2.6 API Testing 
Specifically, the "unittest" module from Python was used to conduct our white box testing. 

To run the white box tests on the API:
1. Run the API locally via "python3 app.py" in PHASE_1 -> API_SourceCode
2. Run "sh api_unit_tests.sh" in PHASE_1 -> TestScripts
*"api_unit_tests.sh" navigates to PHASE_1 -> API_SourceCode to run "python3 api_unit_tests.py" which is where all the testing cases are. "api_unit_tests.py needs to be in the same directory as "app.py" for our API in order to run successfully.*

White box unit testing was conducted on each of the methods which were used to create our API using the data in our database. (See "diseases.db"  in API_SourceCode for the exact version of the database we used for testing).

The functions which were tested include (in this order):
-    **checkInput(startingTime, endTime, keyterms, location)** - checks that the inputs are "valid" for the times and location.
-- Test Cases: variations on the input for dates such as having the exact same start and end time, different dates but same year, different year, start time > end time as well as when both start and end time are in the future. 
-- Test Cases: valid and invalid locations such as "india" (valid), "123!" (invalid). Invalid is defined simply by if the location is not a sequence of characters.
-    **checkDatetime(inputDate)** - checks that the input date/time is not a date in the future.
-- Test Cases: date/time inputs before, after and in the present.
-    **getArticles(startingTime, endTime, keytermsList, location)** - gets article objects by calling queries for the database.
-- Test Cases: an input with articles that exist in the database, an input with articles that exist in database but does not match the keyterms, an input with no articles that satify it in the database.
-    **getReports(reportId)** - gets reports data from the database via the database queries.
-- Test Cases: an id that exists in the database, an id that does not exist in the database
-    **getLocation(locationId)** - gets location data from the database via the database queries.
-- Test Cases: an id that exists in the database, an id that does not exist in the database
-    **getEventReports(eventReportId)** - gets event reports data from the database via the database queries.
-- Test Cases: an id that exists in the database, an id that does not exist in the database
-    **createReturnObject(article_obj, reports_list,  location_list, reported_events_list)** - creates an object using given data, the required format to return back to the API user.
-- Test Cases: sample data from the database to check whether the correct json format is returned
-    **findKeyterms(article_obj, keyTerms_list)** - checks whether any of the key terms in the given list exists in the article (headline or main text).
-- Test Cases: Key terms that can/cannot be found in the article, varying cases of key terms, having one/multiple key terms, having a phrase as input as one key term.

Each of these methods were tested with various cases and edge cases (examples as specified above).

*Note: To see more details in regards to the test cases for API white box testing and its expect outputs, refer to PHASE_1 -> API_SourceCode -> api_unit_tests.py


# 3 Test Assessment
## 3.1 An Overview
For testing, we used a range of JSON data, both valid and invalid, for our GET requests. All valid data included a field for a start time, an end time, a string of comma separated key terms, and a location. For invalid data, many types of incorrect data and JSON structures were used, such as the ones mentioned above in negative testing.
Example of a Valid Input File
```
{
    "start time": "2019-02-20T00:18:00",
    "end time": "2019-03-30T22:41:00",
    "keyterms": "fever",
    "location": "Taiwan"
}
```
Example of an Invalid Input File

```
{
    "start time": "Incorrect Input",
    "end time": "2019-02-17T22:41:00",
    "keyterms": "Flu, Pain",
    "location": "Sydney"
}

```

## 3.2 Improvements On Testing
**Test Results and Actions Taken to Improve Them**
The API failed some of the black box test cases due to not having explicitly defined when it is considered an error and need to return error code 400 and when it is not considered an error and to return an empty list with code 200. The tests simply expected the return of an empty list when some of the inputs are invalid whereas the API itself returned code 400 with an error message. Hence, some adjustments were made in this aspect to both the API and the black box tests in order for them to match up and to both expect error code 400 with a detailed message.

The internal methods of the API failed some of the white box unit tests during the testing process. This was due to not having considered enough edge cases in the method's implementation. To resolve this issue, more error checking statements were added to the methods to ensure they passed the tests and performed as desired.

**Future Improvements**
An alternative to using unittest would be javascript or even better typescript which have so many open source modules for this such as mocha and chai. As stated above, we considered this option but decided to use unittest as group members were more familiar with it.


There were a few types of tests that would have been helpful for our API but were not implemented including security testing, and testing the use of the API documentation. For security, measures such as testing against SQL injections and breaking the API would have helped in improving the privacy of data and reliability. However, these were not implemented as we lacked the necessary technical skills to create these tests. For API documentation, testing the ease of use and clarity would have allowed us to ensure the speed at which a user could learn our API, but this was not done as it required a third party participant. An example is given in Apenddix B.


## 3.3 Limitations

For API black box testing, we store example input and output json files which are static and compare the API’s response with the relevant stored example output file. The problem with this is that the website which we are obtaining information from is constantly being updated with new reports and so our database is also constantly being updated with this new information.  However, our example input and output json files are static which means that although there are new outbreaks occurring every day and therefore a constantly fluctuating number of affected people every day, the variable storing the number of affected people in our static output json file does not change accordingly, which can affect our test results. In the future, instead of using static input and output files, we can implement code that directly accesses data from the database and compare the output result.

For API white box testing, things that were not tested were other test cases of inputs such as varying formats of input of date which were assumed to be correct as a precondition for the method. Tests on the methods which writes to the logfile was also not tested as code in white box testing but was manually tested by visually checking whether the logfile updates correctly for different cases. It is also indirectly tested by black box testing on the API.
If time was not a constraint, it would also be great to perform some integration testing for the code, where different "modules" or component are tested together.

# Appendix A : Test Result
| ID | Test Case Description | Expected Output | Test date | Result | Comments |
| -------- | -------- | -------- | ---- | ---- | --- |
| T21A     | Data that is within the date range but not in the same location     | An empty list | 28/03/2019 | Passed |
| T21B | Data that not within the date range but in the same location  | An empty list | 28/03/2019 | Passed |
| T21C | Date that is within the date range and in the same location  | Return in Json format specificed in specification | 28/03/2019 | Passed |
| T21D | Arguments are not strings  | return an error code | 28/03/2019 | Passed |
| T21E | Input string is case sensitive (which shouldn't be)  | Return in Json format specificed in specification | 28/03/2019 | Failed |
| T21F | Input string is case sensitive (which shouldn't be)  | Return in Json format specificed in specification | 29/03/2019 | Passed | Fixed error in the following day |
| T21E | Input string is case sensitive (which shouldn't be)  | Return in Json format specificed in specification | 28/03/2019 | Passed | 
| T22A | An entry that doesn't exist: Less than 0:  | Error Code | 28/03/2019 | Passed | 
| T22B | An entry that doesn't exist: Out of Index:  | Error Code | 28/03/2019 | Passed | 
| T22C | Normal Case  | Return Json Format Specificied in Specification | 28/03/2019 | Passed | 
| T23A | An entry that doesn't exist: Less than 0:  | Error Code | 28/03/2019 | Passed | 
| T23B | An entry that doesn't exist: Out of Index:  | Error Code | 28/03/2019 | Passed | 
| T23C | Normal Case  | Return Json Format Specificied in Specification | 28/03/2019 | Passed | 
| T24A | An entry that doesn't exist: Less than 0:  | Error Code | 28/03/2019 | Passed | 
| T24B | An entry that doesn't exist: Out of Index:  | Error Code | 28/03/2019 | Passed | 
| T24C | Normal Case  | Return Json Format Specificied in Specification | 28/03/2019 | Passed | 


# Appendix B: Example Output
```
[
    {
        "url": "http://outbreaks.globalincidentmap.com/eventdetail.php?ID=31079",
        "date_of_publication": "2019-02-20T00:18:00",
        "headline": "TAIWAN - Dengue Fever Cases Hit Southwest Taiwan",
        "main_text": ""Two dengue fever cases involving foreign university students who had recently spent holidays in Indonesia and Malaysia have been confirmed in Tainan, southwestern Taiwan."", 
        "reports": 
        [{
            "disease": ["Dengue / Hemorrhagic Fever"],                   "syndrome": ["fever"],
            "reported_events": 
            [{
                "type": "presence",    
                "date": "2019-02-20T00:18:00",
                "location": [
                {
                    "country": "Taiwan",
                    "location": "Tainan"
                }],
            "number-affected": null
            }],
        "comment": null
        }]
}]
```
