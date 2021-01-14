#!/usr/local/bin/python3


import pandas as pd
import numpy as np

from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.cluster import KMeans, SpectralClustering, AgglomerativeClustering
from sklearn.ensemble import RandomForestRegressor


from sklearn.metrics import mean_squared_error,r2_score
from sklearn.utils import shuffle
from sklearn.preprocessing import LabelEncoder
from sklearn.externals import joblib

import sqlite3
import pprint
import datetime

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
        AND a.number_affected NOT NULL
        AND a.number_affected <= 1000;
    """
    df = pd.read_sql_query(query,conn)
    df.dropna(inplace=True)
    df = cleanDf(df)
    df = df.reset_index()
    return shuffle(df)

def cleanDf(df):
    df['disease'] = df['disease'].replace(regex=[r'^Swine Flu - Confirmed / Possible Related Death$', 'Swine Flu - Confirmed Cases'], value='Swine Flu')
    df['disease'] = df['disease'].replace(regex=r'^Meningitis Outbreak \( Suspected or Confirmed\)$', value='Meningitis Outbreak')
    df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d %H:%M:%S').dt.strftime('%Y/%m/%d')
    return df

def load_df(df, split_percentage, droped = []):
    df.drop(['index'], axis=1).to_html("db.html")
    df['date'] = date_le.fit_transform(df['date'].tolist())
    df['disease'] = disease_le.fit_transform(df['disease'].tolist())
    #df['number_affected'] = num_affected_le.fit_transform(df['number_affected'].tolist())
    df['country'] = country_le.fit_transform(df['country'].tolist())

    x = df.drop(['index','number_affected'], axis=1).values
    df.drop(['index'], axis=1).to_html("dbAfter.html")
    y = df['number_affected'].values
    split_point = int(len(x) * split_percentage)
    X_train = x[:split_point]
    y_train = y[:split_point]
    X_test = x[split_point:]
    y_test = y[split_point:]
    #print(X_train, y_train, X_test, y_test)
    return X_train, y_train, X_test, y_test

def trainingModel(df, learnModel, drop = []):
    '''
    Return the mean squared error of a df
    The put values that you want to keep in the drop array
    Values can be ['date','disease','number_affected','city','country', 'type']
    '''
    X_train, y_train, X_test, y_test = load_df(df, split_percentage=0.85, droped = drop)
    # train a classifier
    model = learnModel()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    if(logging):
        for i in range(len(y_test)):
            print("Expected:", y_test[i], "Predicted:", y_pred[i])
        # The mean squared error
        print("Mean squared error: %.2f" % mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        print("r2 score: %.2f\n" % r2)

    return mean_squared_error(y_test, y_pred)

def getModel(df, drop = []):
    '''
    Return the model of a df
    The put values that you want to keep in the drop array
    Values can be ['date','disease','number_affected','city','country', 'type']
    '''
    X_train, y_train, X_test, y_test = load_df(df, split_percentage=1, droped = drop)
    model = LinearRegression()
    model.fit(X_train, y_train)

    return model



if __name__ == '__main__':
    logging = False

    date_le = LabelEncoder()
    disease_le = LabelEncoder()
    country_le = LabelEncoder()

    models = [
        GaussianNB,
        KNeighborsClassifier,
        SVC,
        DecisionTreeClassifier,
        LinearDiscriminantAnalysis,
        LogisticRegression,
        LinearRegression,
        KMeans,
        RandomForestRegressor
    ]
    for model in models:
        for i in range(0,4):
            errorCount = list()
            df = read_database('diseases.db')
            errorCount.append(trainingModel(df, model))

        for information in errorCount:
            print(model.__name__+ "-Average: " + str(np.mean(information)))

    model = getModel(read_database('diseases.db'))
    manualTestData = [[
    list(date_le.fit_transform(["2019-05-15T23:36:00"]))[0],
    list(disease_le.transform(["Swine Flu"]))[0],
    list(country_le.transform(["India"]))[0]
    ]]
    print(manualTestData)
    print(np.array(manualTestData))
    res = model.predict(np.array(manualTestData))
    print(res)
    joblib.dump(model, "model.sav")
    # print(X_test)
    # print(type(X_test))
    # print(list(country_le.transform(['Brazil']))[0])
    # print(date_le.inverse_transform([6]))
