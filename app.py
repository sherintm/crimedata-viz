from flask import Flask, render_template, redirect
from flask.json import jsonify
from flask_pymongo import pymongo
from bson.json_util import dumps, loads


# Create an instance of Flask
app = Flask(__name__)

# Use PyMongo to establish Mongo connection
client = pymongo.MongoClient("mongodb://localhost:27017")
database = client['crime_database']
crime_collection = database.get_collection("crime_table")
offence_collection = database.get_collection("offencetable")
victim_collection = database.get_collection("victimtable")

#Route /
@app.route("/")
def home():
    return "Home"

@app.route("/crime_incidents/<year>")
def crime_incidents(year):

    """Fetch the criminal incidents data for specific year"""
    crime_records = crime_collection.find(
        {"Year" : int(year)}, {'_id':0})

    crime_list = list(crime_records)
    # Converting to the JSON
    crime_json_data = dumps(crime_list, indent = 2) 

    return crime_json_data

if __name__ == '__main__':
    app.run(debug=True)
