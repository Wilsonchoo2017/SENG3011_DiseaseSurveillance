import requests
import sqlite3
import re
from sqlite3 import Error
from bs4 import BeautifulSoup

def create_connection(db_file):
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)

    return None

def modify_table(conn, create_table_sql):
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
        c.close()
    except Error as e:
        print(e)

def insert_data(conn, insert_sql, data):
    try:
        c = conn.cursor()
        c.execute(insert_sql, data)
        return c.lastrowid
    except Error as e:
        print(e)

def select_data(conn, select_sql):
    try:
        c = conn.cursor()
        c.execute(select_sql)
        rows = c.fetchall()
        c.close()

        return rows
    except Error as e:
        print(e)

def main(conn):
    sql_delete_location_table =  "DROP TABLE IF EXISTS location;"
    sql_delete_article_table =  "DROP TABLE IF EXISTS article;"
    sql_delete_symptom_table =  "DROP TABLE IF EXISTS symptoms;"
    sql_delete_symptom_article_table =  "DROP TABLE IF EXISTS symptom_article;"

    sql_create_location_table =  """CREATE TABLE IF NOT EXISTS location (
    location_id integer PRIMARY KEY,
    city text,
    country text,
    long decimal,
    lat decimal
);"""

    sql_create_article_table = """CREATE TABLE IF NOT EXISTS article (
    article_id integer PRIMARY KEY,
    date datetime,
    location text,
    url text,
    detailed_url text,
    headline text,
    main_text text,
    disease text,
    comments text,
    type text,
    number_affected integer,
    FOREIGN KEY (location) REFERENCES location (location_id)
);"""

    sql_create_symptom_table = """CREATE TABLE IF NOT EXISTS symptoms (
    symptom_id integer PRIMARY KEY,
    name text
);"""

    sql_create_symptom_article_table = """CREATE TABLE IF NOT EXISTS symptom_article (
    symptom_id integer NOT NULL,
    article_id integer NOT NULL,
    PRIMARY KEY (symptom_id, article_id),
    FOREIGN KEY (symptom_id) REFERENCES symptoms (symptom_id),
    FOREIGN KEY (article_id) REFERENCES article (article_id)
);"""

    if conn is not None:
        modify_table(conn, sql_delete_location_table)
        modify_table(conn, sql_delete_article_table)
        modify_table(conn, sql_delete_symptom_table)
        modify_table(conn, sql_delete_symptom_article_table)

        modify_table(conn, sql_create_location_table)
        modify_table(conn, sql_create_article_table)
        modify_table(conn, sql_create_symptom_table)
        modify_table(conn, sql_create_symptom_article_table)
    else:
        print("Error! cannot create the database connection.")


if __name__ == '__main__':
    conn = create_connection('diseases.db')

    main(conn)

    url = 'http://outbreaks.globalincidentmap.com/'
    wikiSymptomURL = 'https://en.wikipedia.org/wiki/List_of_medical_symptoms'
    page = requests.get(url).text
    soup = BeautifulSoup(page, 'lxml')

    symptomsRegex = ''
    symptomsList = []
    wikipage = requests.get(wikiSymptomURL).text
    wikisoup = BeautifulSoup(wikipage, 'lxml')

    symptomDivs = wikisoup.findAll('div', attrs={'class': 'div-col'});
    for i in symptomDivs:
        symptoms = i.findAll('a')
        for link in symptoms:
            symptom = re.sub(' \(.*?\)', '', link['title'].lower())
            if(symptom not in symptomsList):
                symptomsList.append(symptom)
    for i in symptomsList:
        symptomsRegex = symptomsRegex + '^' + i + ' ' + '| ' + i + '$| ' + i + '[\\., ]' + '|'

    symptomsRegex = symptomsRegex[:-1]

    headers = soup.findAll('td', attrs={'class': 'events-head'}) # Get all disease headers
    for i in headers:
        headerRow = i.parent.parent.parent.parent
        dataRow = headerRow.findNextSibling('tr')
        dataTable = dataRow.find('table', attrs={'cellspacing': '2'})
        dataRows = dataTable.findAll('tr')
        if(dataRows[1].find('td').text.strip() != 'No Event to Display'): # Diseases that have recorded outbreaks
            for x in range(1, len(dataRows)):
                dataCells = dataRows[x].findAll('td')

                disease = i.text.strip()
                date = dataCells[0].text.strip()
                country = dataCells[2].text.strip()
                location = dataCells[3].text.strip()
                headline = dataCells[5].text.strip()
                detailURL = url + dataCells[1].find('a')['href']

                number_affected = None

                date = re.sub(' ', 'T', date)

                numbers = re.findall("^[0-9]+|[0-9]+$| [0-9]+ ", headline)
                if(len(numbers) > 0):
                    number_affected = numbers[0].strip()
                    number_affected = re.sub('\.', '', number_affected)

                type = 'presence' # Default
                if(re.search('kill|death|die|dead|casualty|casualties|toll', headline.lower())):
                    type = 'death'
                elif(re.search('infect', headline.lower())):
                    type = 'infected'
                elif(re.search('hospitalised|hospitalized', headline.lower())):
                    type = 'hospitalised'

                detailpage = requests.get(detailURL).text
                detailSoup = BeautifulSoup(detailpage, 'lxml')

                summaryTable = detailSoup.find('table', attrs={'cellspacing': '2'})
                summaryRows = summaryTable.findAll('tr')

                latLongRow = summaryRows[2]
                lat = latLongRow.findAll('td')[1].text.strip()
                long = latLongRow.findAll('td')[3].text.strip()

                articleURLRow = summaryRows[3]
                if(articleURLRow.find('a')):
                    articleURL = articleURLRow.find('a')['href']
                elif(detailSoup.find('table', attrs={'cellpadding': '15'}).find('a')):
                    articleURL = detailSoup.find('table', attrs={'cellpadding': '15'}).find('a')['href'];
                else:
                    articleURL = None

                mainTextRow = detailSoup.find('tr', attrs={'class': 'tdtext'})
                mainTextDiv = mainTextRow.findAll('div')[1]
                if(mainTextDiv.find('strong')):
                    mainText = mainTextDiv.find('strong').text.strip()
                else:
                    mainText = mainTextDiv.text.strip()

                symptoms = re.findall(symptomsRegex, mainText.lower())
                symptoms = list(dict.fromkeys(symptoms))

                # Add location to DB
                location_query = "SELECT * FROM location WHERE country='" + country + "' AND city='" + location + "' AND long=" + long + " AND lat=" + lat + ";"
                location_results = select_data(conn, location_query)
                location_id = 0

                if(len(location_results) > 0):
                    location_id = location_results[0][0]
                else:
                    location_insert = "INSERT INTO location (city, country, long, lat) VALUES (?, ?, ?, ?);"
                    location_id = insert_data(conn, location_insert, (location, country, long, lat))

                # Add article to DB
                article_insert = "INSERT INTO article (date, location, url, detailed_url, headline, main_text, disease, comments, type, number_affected) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
                article_id = insert_data(conn, article_insert, (date, location_id, detailURL, articleURL, headline, mainText, disease, None, type, number_affected))

                # Add symptoms to DB
                for symptom in symptoms:
                    symptom = symptom.strip()
                    symptom = re.sub('[\.,]', '', symptom)
                    symptom_query = "SELECT * FROM symptoms WHERE name='" + symptom + "';"
                    symptom_results = select_data(conn, symptom_query)
                    symptom_id = 0
                    if(len(symptom_results) > 0):
                        symptom_id = symptom_results[0][0]
                    else:
                        symptom_insert = "INSERT INTO symptoms (name) VALUES (?);"
                        symptom_id = insert_data(conn, symptom_insert, (symptom,))

                    symptom_report_insert = "INSERT INTO symptom_article (symptom_id, article_id) VALUES (?, ?);"
                    insert_data(conn, symptom_report_insert, (symptom_id, article_id))
    conn.commit()
