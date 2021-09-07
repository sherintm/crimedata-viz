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
# result_1 = crime_collection.find({
#     "Year" : 2021
# })
# for i in result_1:
#     print(i)
#Route to render index.html template using data from Mongo
@app.route("/")
def home():

    # # Find one record of data from the mongo database
    # mars_data = mongo.db.crime_table.find_one()
    # print(mars_data)
    # # Return template and data
    # return render_template("index.html", mars_data=mars_data)
    return "Home"

@app.route("/crime_incidents/<year>")
def crime_incidents(year):
    """Fetch the criminal incidents data for specific year"""
    result_1 = crime_collection.find(
        {"Year" : 2021},{"_id" : 0})
    for i in result_1:
        print(i)
    crime_list = list(result_1)
  
    # Converting to the JSON
    json_data = dumps(crime_list, indent = 2) 
   

    return str(crime_list)

if __name__ == '__main__':
    app.run(debug=True)
