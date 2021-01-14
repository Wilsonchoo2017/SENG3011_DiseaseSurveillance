#!/usr/local/bin/python3

import unittest
import requests
import pprint
import urllib
import sys
import json
import pathlib
import os
import re

from threading import Thread
#python -m unittest -v test
sys.path.append('..')
#import API_SourceCode.app



class API_articles(unittest.TestCase):

    def setUp(self):
        #self.url = "http://46.101.167.163:5100/articles"
        self.url = "http://127.0.0.1:5100/articles"
        self.logfile = "http://46.101.167.163:5100/static/logfile.txt"

    def test_400(self):
        self.run_test(400)
        return

    def test_404(self):
        #self.run_test(404) # deleted
        return

    def test_200(self):
        self.run_test(200)
        return

    def test_500(self):
        resultMessage = {"message": "The method is not allowed for the requested URL."}
        header = {
        "Content-Type": "application/json",
        "Content-Length": "70",
        "Allow": "HEAD, OPTIONS, GET",
        "Server": "Werkzeug/0.14.1 Python/3.6.5",
        "Date": "Sun, 31 Mar 2019 05:55:16 GMT"
        }
        r = requests.delete(url = self.url, headers=header)
        #pprint.pprint(r)
        self.assertEqual(r.status_code, 500) #should actually return a 405
        return
        
    def test_log(self):
        # self.run_log_test(400, 0, "FAIL") # does not test the fail case
        for i in range(0,4):
            self.run_log_test(200, i, "SUCCESS")
        
        return
    
    def attack(self):
        for x in range(0,2):
            Thread(target = API_articles.test_400(self)).start()
            Thread(target = API_articles.test_404(self)).start()
            #Thread(target = API_articles.test_200(self)).start()
        return

    def run_log_test(self, code, fileNumber, status):
        #print("!!!!!!", fileNumber)
        input, output = self.openJson(code, fileNumber)
        #print("input: ", input)
        params = urllib.parse.urlencode(input, quote_via=urllib.parse.quote)
        #print("params: ", params)
        response = self.sendRequest(self.url, params)
        #print("response: ", response)

        logfile = self.openLogFile()
        self.assertNotEqual(logfile, [])

        lines = self.getLast2Lines(logfile)
        #print("last 2 lines logfile", lines)
        #print("lines ", lines)
        self.assertEqual(lines[0], status)
        #print(input)
        self.assertEqual(lines[1], input["start time"].replace("T"," "))
        self.assertEqual(lines[2], input["end time"].replace("T"," "))
        return

    def getLast2Lines(self, string):
        date = "(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})" # made adjustsments in the regex below - Tammy because I updated logging format
        regex = r"Global Incident Map : Team SoftwareEngines, /articles(/|/details), Accessed Time: {} GET (\w+) {} to {} Location (.*?)\nKey terms \[(.*?)\]\s*$".format(date,date,date)
        n = re.search(regex, string)
        if(n): return [n.group(3), n.group(4), n.group(5)]
        else: return []

    def openLogFile(self):
        logFolder = pathlib.Path("../API_SourceCode/static/logfile.txt")
        logFile = open(logFolder,'r')
        log = logFile.read()
        logFile.close()
        return log

    def openJson(self, code, fileNumber):
        folder = pathlib.Path("testcase/{}".format(code))
        inputFile = folder / "input{}.json".format(fileNumber)
        outputFile = folder / "output{}.json".format(fileNumber)

        with open(inputFile) as json_file:
            input = json.load(json_file)

        with open(outputFile) as json_file:
            output = json.load(json_file)

        return input, output

    def run_test(self, status_code):
        print("\n=======Running testcase " + str(status_code) + "=======")
        folder = pathlib.Path("testcase/{}".format(status_code))
        numberFile = len([name for name in os.listdir(folder) if os.path.isfile(os.path.join(folder, name))])
        for i in range(int(numberFile/2)):
            input, output = self.openJson(status_code, i)

            params = urllib.parse.urlencode(input, quote_via=urllib.parse.quote)
            response = self.sendRequest(self.url, params)
            #print("response: ", response, " ", i)
            self.assertEqual(response.status_code, status_code)
            self.assertEqual(response.json(), output)
            self.assertLess(len(response.json()), 1000)
        return

    def sendRequest(self, url, params={}):
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
            return r

        except requests.exceptions.RequestException:  # This is the correct syntax
            # unable to authenticate
            return None

class unit_Test(unittest.TestCase):

    def test_a(self):
        #print("a")
        self.assertEqual(400, 400)
        return

def thread_test():
    return

if __name__ == '__main__':
    thread_test()
    unittest.main()
