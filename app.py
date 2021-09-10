from flask import Flask
from flask_pymongo import pymongo
from bson.json_util import dumps
from flask_cors import CORS, cross_origin
import os
import json

# Create an instance of Flask
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Use PyMongo to establish Mongo connection
client = pymongo.MongoClient("mongodb://localhost:27017")
database = client['crime_database']
crime_collection = database.get_collection("crime_table")
lga_data_collection = database.get_collection("lga_data_table")
offence_collection = database.get_collection("offence_table")
victim_collection = database.get_collection("victim_table")

lga_file_path = os.path.join("Data", "VIC_LGA_shp2.json")
polygon_file_path = os.path.join("Data", "VIC_LGA_POLYGON_shp.json")
updated_lga_path = os.path.join("Data", "Updated_LGA.json")

with open(lga_file_path) as jsonfile:
    lga_json = json.load(jsonfile)

with open(polygon_file_path) as jsonfile:
    polygon_json = json.load(jsonfile)

#print(lga_json)
inc = 0
for feature in lga_json['features']:
    #print(feature['properties']['ABB_NAME'])
    lga_json['features'][inc]['geometry'] = polygon_json['geometries'][inc]
    inc += 1

with open(updated_lga_path, "w") as outfile:
    json.dump(lga_json, outfile)

#Route /
@app.route("/")
@cross_origin()
def home():
    return "Home"

@app.route("/crime_incidents")
@cross_origin()
def all_crime_incidents():

    """Fetch the criminal incidents data for specific year"""
    crime_records = crime_collection.find(
        {}, {'_id':0})

    crime_list = list(crime_records)
    # Converting to the JSON
    crime_json_data = dumps(crime_list, indent = 2) 
    print(crime_json_data)
    return crime_json_data

@app.route("/crime_incidents/<year>")
@cross_origin()
def crime_incidents(year):

    """Fetch the criminal incidents data for specific year"""
    crime_records = crime_collection.find(
        {"year" : int(year)}, {'_id':0})

    crime_list = list(crime_records)
    # Converting to the JSON
    crime_json_data = dumps(crime_list, indent = 2) 
    print(crime_json_data)
    return crime_json_data

@app.route("/offence_type")
@cross_origin()
def all_offence_type():

    """Fetch the criminal incidents data for specific year"""
    offence_records = offence_collection.find(
        {}, {'_id':0})

    offence_list = list(offence_records)
    # Converting to the JSON
    offence_json_data = dumps(offence_list, indent = 2) 
    print(offence_json_data)
    return offence_json_data

@app.route("/offence_type/<year>")
@cross_origin()
def offence_type(year):

    """Fetch the criminal incidents data for specific year"""
    offence_records = offence_collection.find(
        {"year" : int(year)}, {'_id':0})

    offence_list = list(offence_records)
    # Converting to the JSON
    offence_json_data = dumps(offence_list, indent = 2) 
    print(offence_json_data)
    return offence_json_data

@app.route("/victim_data")
@cross_origin()
def all_victim_data():

    """Fetch the criminal incidents data for specific year"""
    victim_records = victim_collection.find(
        {}, {'_id':0})

    victim_list = list(victim_records)
    # Converting to the JSON
    victim_json_data = dumps(victim_list, indent = 2) 
    print(victim_json_data)
    return victim_json_data

@app.route("/victim_data/<year>")
@cross_origin()
def victim_data(year):

    """Fetch the criminal incidents data for specific year"""
    victim_records = victim_collection.find(
        {"year" : int(year)}, {'_id':0})

    victim_list = list(victim_records)
    # Converting to the JSON
    victim_json_data = dumps(victim_list, indent = 2) 
    print(victim_json_data)
    return victim_json_data

@app.route("/lga_crime_data/<year>")
@cross_origin()
def lga_crime_data(year):

    lga_data_records = lga_data_collection.find(
    {}, {'_id':0})

    crime_records = crime_collection.find(
    {"year" : int(year)}, {'_id':0})

    lga_data_list = list(lga_data_records)

    for crime_data in crime_records:
        i = 0

        for lga in lga_data_list:
            #print(lga)
            lga_crime_data = {}
            if(lga['properties']['vic_lga__3'] == crime_data['lga'].upper()):
                lga_crime_data['year'] = crime_data['year']
                lga_crime_data['incidents_recorded'] = crime_data['incidents_recorded']
                lga_crime_data['rate_per_100k'] = crime_data['rate_per_100k_population']
                lga_data_list[i]['properties']['lga_crime_data'] = lga_crime_data
                print(lga_crime_data)
                print(lga['properties']['vic_lga__3'])
                print(i)
            i += 1

    # Converting to the JSON
    lga_crime_json_data = dumps(lga_data_list, indent = 2)

    return lga_crime_json_data

@app.route("/lga_crime_data_adv/<year>")
@cross_origin()
def lga_crime_data_adv(year):

    crime_records = crime_collection.find(
    {"year" : int(year)}, {'_id':0})

    for crime_data in crime_records:
        i = 0
        for feature in lga_json['features']:
            if(feature['properties']['ABB_NAME'] == crime_data['lga'].upper()):
                lga_crime_data = {}
                lga_crime_data['year'] = crime_data['year']
                lga_crime_data['incidents_recorded'] = crime_data['incidents_recorded']
                lga_crime_data['rate_per_100k'] = crime_data['rate_per_100k_population']
                lga_json['features'][i]['properties']['lga_crime_data'] = lga_crime_data
                print(lga_crime_data)
            i += 1
    return lga_json

if __name__ == '__main__':
    app.run(debug=True)
