#!/usr/local/bin/python3

'''
This file contains all code related to the implementation of the API (4 endpoints)

'''

import json
from flask import Flask, request
from flask_restplus import Resource, Api
from flask_restplus import fields, inputs, reqparse
import requests
import datetime
import pprint
import time
from flask_restplus import fields
from flask import jsonify
import re # splitting string with double delimeter
from query import *

from sklearn.preprocessing import LabelEncoder
from sklearn.externals import joblib
from sklearn.linear_model import LinearRegression
import pandas as pd
import numpy as np
import sqlite3


app = Flask(__name__)
api = Api(app,
          default="SoftwareEngines",  # Default namespace
          title="API for Global Incident Map",  # Documentation Title
          description="An API developed by the SoftwareEngines Team to provide disease reports/articles from Global Incident Map (data source).")  # Documentation Description

parser = reqparse.RequestParser()
parser.add_argument("start time", type=inputs.datetime_from_iso8601, help='Format yyyy-MM-ddTHH:mm:ss e.g. 2019-02-17T22:41:00', required=True)
parser.add_argument("end time", type=inputs.datetime_from_iso8601, help='Format yyyy-MM-ddTHH:mm:ss e.g. 2019-02-17T22:41:00', required=True)
parser.add_argument("keyterms", type=str, help='Comma separated list of all the key terms e.g. Anthrax,Zika')
parser.add_argument("location", type=str,  help='Location name (city/country/state) e.g. India', required=True)   # need to clarify whether this is a required input

parser1 = reqparse.RequestParser()
parser1.add_argument("start time", type=inputs.datetime_from_iso8601, help='Format yyyy-MM-ddTHH:mm:ss e.g. 2019-02-17T22:41:00', required=True)
parser1.add_argument("end time", type=inputs.datetime_from_iso8601, help='Format yyyy-MM-ddTHH:mm:ss e.g. 2019-02-17T22:41:00', required=True)
parser1.add_argument("keyterms", type=str, help='Comma separated list of all the key terms e.g. Anthrax,Zika')
parser1.add_argument("location", type=str,  help='Location name (city/country/state) e.g. India')

predPar = reqparse.RequestParser()
predPar.add_argument("date", type=inputs.date_from_iso8601, help='Format yyyy-MM-dd e.g. 2019-02-17', required=True)
predPar.add_argument("country", type=str,  help='Country ONLY  e.g. India', required=True)
predPar.add_argument("disease", type=str,  help='disease e.g. Swine Flu	 ', required=True)



api.namespaces.clear()
app.config['RESTPLUS_MASK_SWAGGER'] = False # gets rid of the X-field -default header field

################# MODELS that define the server response structure #####################

location = api.model('location',{
  "country": fields.String(example="Australia"),
  "location": fields.String(example="Sydney")
})

event_report = api.model('reported_events',{
  "type": fields.String(example="recovered"),
  "date": fields.String(example="2018-12-01Txx:xx:xx to 2018-12-10Txx:xx:xx"),
  "location": fields.List(fields.Nested(location)),
  "number-affected": fields.Integer(min=0,example=1)
})

report = api.model('reports',{
  "disease": fields.List(fields.String(example="influenza a/h5n1")),
  "syndrome": fields.List(fields.String(example="Acute fever and rash")),
  "reported_events": fields.List(fields.Nested(event_report)),
  "comment": fields.String()
})

articles_list = api.model('article',{
  "url": fields.String(example="www.who.int/lalala"),
  "date_of_publication": fields.String(example="2018-12-12Txx:xx:xx"),
  "headline": fields.String(example="Outbreaks in Southern Vietnam"),
  "main_text": fields.String(example="Three people infected by what is thought to be H5N1 or H7N9  in Ho Chi Minh city. First infection occurred on 1 Dec 2018,and latest is report on 10 December. Two in hospital, one has recovered. Furthermore, two people with fever and rash infected by an unknown disease."),
  "reports": fields.List(fields.Nested(report))
})

articles_details_list = api.model('article_details',{
  "url": fields.String(example="www.who.int/lalala"),
  "details_url": fields.String(example="www.whodetails.int/lalala"),
  "date_of_publication": fields.String(example="2018-12-12Txx:xx:xx"),
  "headline": fields.String(example="Outbreaks in Southern Vietnam"),
  "main_text": fields.String(example="Three people infected by what is thought to be H5N1 or H7N9  in Ho Chi Minh city. First infection occurred on 1 Dec 2018,and latest is report on 10 December. Two in hospital, one has recovered. Furthermore, two people with fever and rash infected by an unknown disease."),
  "disease": fields.List(fields.String(example="influenza a/h5n1")),
  "syndrome": fields.List(fields.String(example="Acute fever and rash")),
  "type": fields.String(example="recovered"),
  "date": fields.String(example="2018-12-01Txx:xx:xx"),
  "country": fields.String(example="Australia"),
  "location": fields.String(example="Sydney"),
  "latitude": fields.Float(example="-29.812"),
  "longitude": fields.Float(example="30.804"),
  "number-affected": fields.Integer(min=0,example=1),
  "comment": fields.String()
})

logs = api.model('logs', {
       "logs": fields.String(example="Global Incident Map : Team SoftwareEngines, /articles/, Accessed Time: 2019-02-06 13:16:12 GET SUCCESS 2019-02-20 00:18:00 to 2019-03-30 22:41:00 Location Taiwan\nKey terms [fever]\n\n")
})

####################################################################

db = Query()

articles = api.namespace('articles', description='Access to disease articles/reports')

# endpoint to get all disease reports in the expected format from the spec
@articles.route('/')
class Disease(Resource):
    @api.marshal_list_with(articles_list)
    @api.response(400, 'Bad Request')
    @api.response(200, 'Successful')
    @api.doc(description="Find disease article(s) by date, time, keyterms and location.")
    @api.expect(parser)
    def get(self):
        # Grab all input arguments
        args = parser.parse_args()

        startingTime = args.get('start time') #datetime object
        endTime = args.get('end time') #datetime object
        keytermsString = args.get('keyterms') #string of keyterms
        location = args.get('location') #location in string format

        if keytermsString is not None:
            keytermsList = keytermsString.split(',') #stringToList(keytermsString) #converts key terms into a list
        else:
            keytermsList = []

        #Check that input args are valid
        if(checkInput(startingTime, endTime, keytermsList, location) == False):
            writeToLog("/articles/",startingTime, endTime, keytermsString, location, "FAIL")
            api.abort(400, "Invalid input parameters. Please check your start time is earlier or the same as your end time and the times are not in the future. Please also check you have entered valid location.")

        # placed up here instead of down at the bottom
        writeToLog("/articles/", startingTime, endTime, keytermsString, location, "SUCCESS")

        # process date/time input to pass to db in the db required format
        startingTime = str(startingTime)
        endTime = str(endTime)
        startingTime = startingTime.replace(' ', 'T')
        endTime = endTime.replace(' ', 'T')

        # initialise a list to store returned article objects
        return_list = []

        articles_list = getArticles(startingTime, endTime, keytermsList, location)

        # if articles list is empty
        if not articles_list:
            return return_list

        # for each article object, get all nested data and combine to make return object/list
        for article_obj in articles_list:
            # note: each "list" only contains one item - assumption made
            # extract the ids
            reportId = article_obj['article_id']
            reports_list = getReports(reportId)

            locationId = article_obj['location']
            location_list = getLocation(locationId)

            reportedEventsId = reports_list[0]['article_id'] # report_obj['article_id'] # there is only one report in report list
            reported_events_list = getEventReports(reportedEventsId) # returns as a list of one item

            return_object = createReturnObject(article_obj, reports_list,  location_list, reported_events_list)

            return_list.append(return_object)

        return return_list

# endpoint to return log of records of all API calls from client
@articles.route('/logs')
class logs(Resource):
    @api.doc(description="Provides the content of the output logfile (with success & error logs of requests to the API) as a string.")
    @api.response(200, 'Successful', logs)
    def get(self):
        logfile = open("static/logfile.txt","r")
        file_content = logfile.read()
        logfile.close()
        return {"logs" : file_content}

# endpoint to return all disease reports with more details in a simpler format
@articles.route('/details')
class Disease(Resource):
    @api.marshal_list_with(articles_details_list)
    @api.response(400, 'Bad Request')
    @api.response(200, 'Successful')
    @api.doc(description="Find disease article(s) by date, time, keyterms and location (with more details and a more simplified output format).")
    @api.expect(parser1)
    def get(self):
        #Grab all input arguments
        args = parser1.parse_args()
        
        startingTime = args.get('start time') #datetime object
        endTime = args.get('end time') #datetime object
        keytermsString = args.get('keyterms') #string of keyterms
        location = args.get('location') #location in string format

        if location is None:
            location = ""

        if keytermsString is not None:
            keytermsList = keytermsString.split(',') #converts key terms into a list
        else:
            keytermsList = []

        #Check that input args are valid
        if(checkInput(startingTime, endTime, keytermsList, location) == False):
            writeToLog("/articles/details", startingTime, endTime, keytermsString, location, "FAIL")
            api.abort(400, "Invalid input parameters. Please check your start time is earlier or the same as your end time and the times are not in the future. Please also check you have entered valid location.")

        # placed up here instead of down at the bottom - to be changed
        writeToLog("/articles/details", startingTime, endTime, keytermsString, location, "SUCCESS")

        # process date/time input to pass to db in the db required format
        startingTime = str(startingTime)
        endTime = str(endTime)
        startingTime = startingTime.replace(' ', 'T')
        endTime = endTime.replace(' ', 'T')

        # initialise a list to store returned article objects
        return_list = []

        articles_list = getArticles(startingTime, endTime, keytermsList, location)

        # if articles list is empty
        if not articles_list:
            return return_list

        # for each article object, get all nested data and combine to make return object/list
        for article_obj in articles_list:
            # note: each "list" only contains one item - assumption made
            # extract the ids
            reportId = article_obj['article_id']
            reports_list = getReports(reportId)

            locationId = article_obj['location']
            location_list = getLocation(locationId)

            reportedEventsId = reports_list[0]['article_id'] #report_obj['article_id'] # there is only one report in report list
            reported_events_list = getEventReports(reportedEventsId) # returns as a list of one item


            return_object = createDetailsReturnObject(article_obj, reports_list,  location_list, reported_events_list)

            return_list.append(return_object)

        return return_list

# endpoint to return a prediction number of people affected in the following week
@articles.route('/prediction')
class Prediction(Resource):
    @api.response(404, 'Not found')
    @api.response(200, 'Successful')
    @api.expect(predPar)
    @api.doc(description="Get a prediction of number of people affected")
    def get(self):
        df = read_database("static/diseases.db")

        date_le = LabelEncoder()
        disease_le = LabelEncoder()
        country_le = LabelEncoder()

        model = getModel(read_database("diseases.db"), date_le, disease_le, country_le)
        predictionPrep(df, date_le, disease_le, country_le)

        args = predPar.parse_args()
        date = args.get('date')
        disease = args.get('disease')
        country = args.get('country')

        date = date.strftime('%Y/%m/%d')
        check_df = df.query(f'disease == "{disease}" and country == "{country}"')
        if check_df.empty:
            output_response = {
                "prediction" : f" Unable to predict for these values"
            }
            return output_response, 404

        date_check = df.query(f'date == "{date}"')
        if(date_check.empty):
            datefit = list(date_le.fit_transform([date]))[0]
        else:
            datefit = list(date_le.transform([date]))[0]

        manualTestData = [[
        datefit,
        list(disease_le.transform([disease]))[0],
        list(country_le.transform([country]))[0]
        ]]
        res = model.predict(np.array(manualTestData))
        print(type(res))
        return {"prediction":res[0]}


##############################
#####HELPER FUNCTIONS######
##############################

# precondition: data is in the correct datetime format, date is as datetime object
def checkInput(startingTime, endTime, keyterms, location):
    '''
    Check input variables are incorrect
    Things to check: time are valid (no future dates), location is a real location
    return boolean - does not check this
    Use checkDatetime function
    :returns: True if valid
    :returns: False if invalid
    '''

    #Check dates are not older than today
    #check startingtime is smaller than ending ending time
    if(checkDatetime(startingTime) == False or checkDatetime(endTime) == False):
        #print("1\n\n")
        return False
    if(startingTime > endTime):
        #print ("2 starting time greater than endtime\n\n")
        return False

    # if location was passed in as empty - i.e. it would be from the second details call
    if location is "":
        return True

    # check location valid - i.e. all alphabets
    location_copy = location
    location_copy = location_copy.replace(" ", "")

    return location_copy.isalpha()

    return True

# checks if the date is before the current date
# inputDate is datetime object
def checkDatetime(inputDate):
    '''
    Check that the input datetime object is valid
    :returns: True if valid
    :returns: False if invalid
    '''
    highestValueDate = datetime.datetime.now() # the largest date you can have is current time!
    if(inputDate > highestValueDate): return False
    else: return True

def writeToLog(call, startingTime, endTime, keytermsString, location, status):
    '''
    writes in log file
    E.g. 03/22 08:51:06 TRACE  :...read_physical_netif: Home list entries returned = 7
    @param status = FAIL or SUCCESS
    '''
    keytermsString, location = variableCheck(keytermsString, location)
    currentDate = datetime.datetime.now()

    logfile = open("static/logfile.txt","a+")

    logfile.write("Global Incident Map : " + "Team SoftwareEngines, " + call + ", " + "Accessed Time: " + dateToString(currentDate) + " GET " + status + " " + dateToString(startingTime) + " to " + dateToString(endTime) + " Location " + location + "\n")
    logfile.write("Key terms [" + keytermsString + "]\n\n")

    logfile.read()
    logfile.close()
    return;

def variableCheck(keytermsString, location):
    if(keytermsString is None): keytermsString = ""
    if(location is None): location = ""
    return keytermsString, location;

def dateToString(date):
    if(date is None): return "NO DATE"
    return date.strftime("%Y-%m-%d %H:%M:%S")

def createReturnObject(article_obj, reports_list,  location_list, reported_events_list):

    return {
            "url": article_obj["url"],
            "date_of_publication": article_obj["date"],
            "headline": article_obj["headline"],
            "main_text": article_obj["main_text"],
            "reports": [
              {
                "disease": [reports_list[0]["disease"]], # assuming theres only one or zero disease or syndrome rn
                "syndrome": reports_list[0]["sydnrome"],
                "reported_events": [
                  {
                    "type": reported_events_list[0]["type"],
                    "date": reported_events_list[0]["date"],
                    "location": [
                      {
                        "country": location_list[0]["country"],
                        "location": location_list[0]["city"]
                      }
                    ],
                    "number-affected": reported_events_list[0]["number_affected"]
                  }
                ],
                "comment": reports_list[0]["comments"]
              }
            ]
    }

def createDetailsReturnObject(article_obj, reports_list,  location_list, reported_events_list):

    return {
            "url": article_obj["url"],
            "details_url": article_obj["detailed_url"],
            "date_of_publication": article_obj["date"],
            "headline": article_obj["headline"],
            "main_text": article_obj["main_text"],
            "disease": [reports_list[0]["disease"]], # assuming theres only one or zero disease or syndrome rn
            "syndrome": reports_list[0]["sydnrome"],
            "type": reported_events_list[0]["type"],
            "date": reported_events_list[0]["date"],
            "country": location_list[0]["country"],
            "location": location_list[0]["city"],
            "latitude": location_list[0]["lat"],
            "longitude": location_list[0]["long"],
            "number-affected": reported_events_list[0]["number_affected"],
            "comment": reports_list[0]["comments"]
        }


##############################
#
# Retrieve Data From Database
#
##############################

# fetch location objects list given a location id 
def getLocation(locationId):
    # returns a location object corresponding to the locationId
    locationId = str(locationId)

    location_list = db.get_db_article_location(locationId)
    if not location_list:
        return []

    location_list = json.loads(location_list)
    # print("location list: ", location_list)
    return location_list

# fetch event reports list given an event report id
def getEventReports(eventReportId):
    # returns an eventReport object corresponding to the eventReportId
    eventReportId = str(eventReportId)

    reported_events_list = db.get_db_article_reported_events(eventReportId)

    if not reported_events_list:
        return []

    reported_events_list = json.loads(reported_events_list)

    return reported_events_list

# fetch list of reports given a report id
def getReports(reportId):
    # change reportid to a str
    reportId = str(reportId)

    # returns a report object corresponding to the reportId && event report
    reports_list = db.get_db_article_reports(reportId)

    if not reports_list:
        return []

    reports_list = json.loads(reports_list)

    return reports_list

# gets articles from db and processes it according to keywords
# assumes that date and time are completely correct
# starting and ending time are strings
def getArticles(startingTime, endTime, keytermsList, location):
    # returns article json object(s), reportId(s), locationId(s)

    db_list = db.get_db_articles(startingTime, endTime, location)

    return_list = []

    db_list = json.loads(db_list) 
    return_list = []
    # for every item in the returned list of articles
    for item in db_list:
        # check if keyword exists in maintext or headline or key word list is empty
        if keytermsList is [] or findKeyterms(item, keytermsList) is True:
            return_list.append(item)
        else:
            # otherwise skip
            # don't need this article
            continue

    return return_list

# checks whether the keyterms are in the article
def findKeyterms(article_obj, keytermsList):
    headline = article_obj["headline"]
    main_text = article_obj["main_text"]

    # ensure that everything is lower cased so that it can be searched in a not case sensitive way
    headline = headline.lower()
    main_text = main_text.lower()

    if not keytermsList:
        return True

    # lowercase the key terms list items
    for term in keytermsList:
        term = term.lower()
        # if any of the key terms in list is found in headline or main_text
        if headline.count(term) or main_text.count(term) is not 0:
            return True

    return False


def sendRequest(url, params):
    '''
    This function sends a request to a endpoint/webpage
    Inputs - url page and any parametersself.
    Should be helpful when call eventreports, location and reports endpoints/webpages
    And can be used to complete getEventReports(), getLocation(), getReports()
    '''
    try:
        #This section is here if you want to add authentication later on
        '''
        api_token = requests.get(url = "{}/token".format(URL), params = auth_credentials).json()

        if 'token' not in api_token: # Check if unable to retrieve token
            print("Uable to get a authorisation token. Invalid credentials.")
            return None

        api_token = api_token['token']
        '''
        r = requests.get(url = url, params = params)#, headers={'AUTH-TOKEN' : api_token})
        return r.json()

    except requests.exceptions.RequestException:  # This is the correct syntax
        # unable to authenticate
        return None


def predictionPrep(df, date_le, disease_le, country_le):
    date_le.fit_transform(df['date'].values)
    disease_le.fit_transform(df['disease'].values)
    country_le.fit_transform(df['country'].values)
    return

def load_df(df, date_le, disease_le, country_le, split_percentage, droped = []):
    # df.drop(['index'], axis=1).to_html("db.html")
    df['date'] = date_le.fit_transform(df['date'].tolist())
    df['disease'] = disease_le.fit_transform(df['disease'].tolist())
    #df['number_affected'] = num_affected_le.fit_transform(df['number_affected'].tolist())
    df['country'] = country_le.fit_transform(df['country'].tolist())

    x = df.drop(['index','number_affected'], axis=1).values
    # df.drop(['index'], axis=1).to_html("dbAfter.html")
    y = df['number_affected'].values
    split_point = int(len(x) * split_percentage)
    X_train = x[:split_point]
    y_train = y[:split_point]
    X_test = x[split_point:]
    y_test = y[split_point:]
    #print(X_train, y_train, X_test, y_test)
    return X_train, y_train, X_test, y_test

def getModel(df, date_le, disease_le, country_le, drop = []):
    '''
    Return the model of a df
    The put values that you want to keep in the drop array
    Values can be ['date','disease','number_affected','city','country', 'type']
    '''
    X_train, y_train, X_test, y_test = load_df(df, date_le, disease_le, country_le, split_percentage=1, droped = drop)
    model = LinearRegression()
    model.fit(X_train, y_train)

    return model

def read_database(path = 'diseases.db'):
    '''
    Given a path or a db it read the db
    And return a pandas df file with the content shuffled content
    '''
    conn = sqlite3.connect(path)
    query = """
        SELECT a.date, a.disease, a.number_affected, l.country FROM 'article' a
        natural join 'location' l
        where a.location = l.location_id
        AND a.number_affected NOT NULL;
    """
    df = pd.read_sql_query(query,conn)
    df.dropna(inplace=True)
    df = cleanDf(df)
    df = df.reset_index()
    return df

def cleanDf(df):
    df['disease'] = df['disease'].replace(regex=[r'^Swine Flu - Confirmed / Possible Related Death$', 'Swine Flu - Confirmed Cases'], value='Swine Flu')
    df['disease'] = df['disease'].replace(regex=r'^Meningitis Outbreak \( Suspected or Confirmed\)$', value='Meningitis Outbreak')
    df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d %H:%M:%S').dt.strftime('%Y/%m/%d')
    return df

if __name__ == '__main__':
    port = 5100
    app.run(debug=True, port=port)
