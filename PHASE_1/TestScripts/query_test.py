import os
import sys

sys.path.insert(0, os.getcwd())
from query import Query

q = Query()
# data that is within the date range but not in the same location
print("Testing function: get_db_articles")
print("Test case 1 - Data that is within the date range but not in the same location: ",
      q.get_db_articles('2019-02-26T00:32:00', '2019-02-27T23:48:00', 'abc'))
print("Test case 2 - Data that is within the date range but not in the same location: ",
      q.get_db_articles('2019-03-12T23:48:00', '2019-03-12T23:48:00', 'abc'))

# Data that not within the date range but in the same location
print("Test case 3 - Data that not within the date range but in the same location: ",
      q.get_db_articles('2019-03-08T03:44:00', '2019-03-08T03:45:00', 'Afghanistan'))
print("Test case 4 - Data that not within the date range but in the same location: ",
      q.get_db_articles('2019-03-10T23:49:00', '2019-03-10T23:50:00', 'Brazil'))

# Date that is within the date range and in the same location
print("Test case 5 - Date that is within the date range and in the same location: ",
      q.get_db_articles('2019-03-12T22:09:00', '2019-03-19T22:13:00', 'Brazil'))

print("Test case 6 - Date that is within the date range and in the same location: ",
      q.get_db_articles('2019-02-22T22:09:00', '2019-03-02T21:27:00', 'Canada'))

# Argument Check
a = ['Brazil']
print("Test case 7 - Argument Check: arguments are not strings: ",
      q.get_db_articles('2019-03-12T22:09:00', '2019-03-19T22:13:00', a))

# finally, check whether casing affects querying, which shouldnt
print("Test case 8 - Argument Check: input string is case sensitive (which shouldn't be): ",
      q.get_db_articles('2019-03-12T22:09:00', '2019-03-19T22:13:00', "bRaZiL"))

# Note datetime is not checked as app.py has does that


print("Testing function: get_db_article_reports")

print("Test case 9 - An entry that doesn't exist: Less than 0: ", q.get_db_article_reports('-1'))
print("Test case 10 - An entry that doesn't exist: Out of Index: ", q.get_db_article_reports('300'))
print("Test case 11 - Normal Entry: ", q.get_db_article_reports('1'))


print("Testing function: get_db_article_location")

print("Test case 12 - An entry that doesn't exist: Less than 0: ", q.get_db_article_location('-1'))
print("Test case 13 - An entry that doesn't exist: Out of Index: ", q.get_db_article_location('300'))
print("Test case 14 - Normal Entry: ", q.get_db_article_location('1'))

print("Testing function: get_db_article_reported_events")
print("Test case 15 - An entry that doesn't exist: Less than 0: ", q.get_db_article_reported_events('-1'))
print("Test case 16 - An entry that doesn't exist: Out of Index: ", q.get_db_article_reported_events('300'))
print("Test case 17 - Normal Entry: ", q.get_db_article_reported_events('1'))
