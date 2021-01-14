import sqlite3
from sqlite3 import Error
import json



class Query:
    def __init__(self):
        # connect to database
        self.sqlite_file = 'diseases.db'

    def create_conn(self):
        try:
            conn = sqlite3.connect(self.sqlite_file)
            return conn
        except Error as e:
            print(e)

        return None
    """
    This function queries database directly. All functions calls this as sub function if that function needs to connect to the database.
    """
    # https://stackoverflow.com/questions/3286525/return-sql-table-as-json-in-python
    def query_db(self, query, args=(), one=False):
        cur = self.create_conn().cursor()
        cur.execute(query, args)
        r = [dict((cur.description[i][0], value) \
                  for i, value in enumerate(row)) for row in cur.fetchall()]
        cur.connection.close()
        return (r[0] if r else None) if one else r
    """
    This function gets article from the table
    returns empty list if there is no data in database, otherwise JSON formats 
    """
    def get_db_articles(self, start_date, end_date, location):
        # make sure argument passed is a string
        if isinstance(start_date, str) and isinstance(end_date, str) and isinstance(location, str) and location is not "":
            data = self.query_db('''select a.url, a.date, a.headline, a.main_text, a.article_id, a.location, a.detailed_url from article a
            join location l on l.location_id = a.location
            where (l.country like ? or l.city LIKE ?) and (a.date between ? and ?)''',
                                 [location, location, start_date, end_date])
            return json.dumps(data)

        elif isinstance(start_date, str) and isinstance(end_date, str) and isinstance(location, str):
            data = self.query_db('''select a.url, a.date, a.headline, a.main_text, a.article_id, a.location, a.detailed_url from article a
            join location l on l.location_id = a.location
            where (a.date between ? and ?)''',
                                 [start_date, end_date])
            return json.dumps(data)

        else:
            print("Err: argument is not string for get_db_articles")
            return []

    
    """
    This function gets reports from the table
    returns empty list if there is no data in database, otherwise JSON formats 
    """
    def get_db_article_reports(self, report_id):
        if int(report_id) < 0:
            print("Err: invalid report_d")
            return []
        if isinstance(report_id, str):
            data0 = self.query_db('''select disease from article where article_id = ?''', [report_id])
            if data0 == []:
                # check if found anything
                # prevents out of index
                return []
            #            y = []
            #            data = []
            #            for x in data0:
            #                for k, v in x.items():
            #                    y.append(v)

            #           data.append({'disease': y})
            data = data0
            data1 = self.query_db('''select symptom_id from symptom_article where article_id = ? ''', [report_id])
            z = []
            for x in data1:
                for k, v in x.items():
                    dict = self.query_db('''select name from symptoms where symptom_id = ? ''', [v])
                    for ki, vi in dict[0].items():
                        z.append(vi)
            #            symptom_names = ', '.join(z)
            data[0].update({'sydnrome': z})
            data2 = self.query_db('''select article_id, comments from article where article_id = ?''', [report_id])
            data[0].update(data2[0])
            return json.dumps(data)
        else:
            print("Err: invalid arguement for get_db_article_reports")


    
    """
    This function gets reports from the table
    returns empty list if there is no data in database, otherwise JSON formats 
    """
    def get_db_article_location(self, location_id):
        if int(location_id) < 0:
            print("Err: invalid location_d")
            return []

        if isinstance(location_id, str):
            data = self.query_db('''select country, city, long, lat from location where location_id = ?''',
                                 [location_id])
            return json.dumps(data)
        else:
            print("Err: argument is not string for get_db_article_location")


    """
    This function gets reported_events from the table
    returns empty list if there is no data in database, otherwise JSON formats 
    """
    def get_db_article_reported_events(self, reported_events_id):
        if int(reported_events_id) < -1:
            print("Err: invalid reported_events_id")
            return None
        if isinstance(reported_events_id, str):
            data = self.query_db('''select type, date, number_affected from article where article_id = ?''',
                                 [reported_events_id])
            return json.dumps(data)
        else:
            print("Err: argument is not string for get_db_articles_reported_events")

