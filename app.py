from flask import Flask, render_template, redirect
from flask.json import jsonify
from flask_pymongo import pymongo
from bson.json_util import dumps, loads


# Create an instance of Flask
app = Flask(__name__)

# Use PyMongo to establish Mongo connection
client = pymongo.MongoClient("mongodb://localhost:27017")
database = client['crimedataDB']
crime_collection = database.get_collection("crimeDB")
offence_collection = database.get_collection("offenceDB")
victim_collection = database.get_collection("victimDB")

#Route /
@app.route("/")
def home():
    return "Home"

@app.route("/crime_incidents/<year>")
def crime_incidents(year):

    """Fetch the criminal incidents data for specific year"""
    crime_records = crime_collection.find(
        {"year" : int(year)}, {'_id':0})

    crime_list = list(crime_records)
    # Converting to the JSON
    crime_json_data = dumps(crime_list, indent = 2) 
    print(crime_json_data)
    return crime_json_data

@app.route("/offence_type/<year>")
def offence_type(year):

    """Fetch the criminal incidents data for specific year"""
    offence_records = offence_collection.find(
        {"year" : int(year)}, {'_id':0})

    offence_list = list(offence_records)
    # Converting to the JSON
    offence_json_data = dumps(offence_list, indent = 2) 
    print(offence_json_data)
    return offence_json_data

@app.route("/victim_data/<year>")
def victim_data(year):

    """Fetch the criminal incidents data for specific year"""
    victim_records = victim_collection.find(
        {"year" : int(year)}, {'_id':0})

    victim_list = list(victim_records)
    # Converting to the JSON
    victim_json_data = dumps(victim_list, indent = 2) 
    print(victim_json_data)
    return victim_json_data

if __name__ == '__main__':
    app.run(debug=True)
