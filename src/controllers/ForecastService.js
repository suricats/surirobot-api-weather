'use strict';

const superagent = require('superagent');

require('../config');
var API_KEY = process.env.API_KEY || 'No valid WHEATHER_API_KEY';
var GEOCODE_API_KEY = process.env.GEOCODE_API_KEY || 'No valide GEOCODE_API_KEY';

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: GEOCODE_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
var geocoder = NodeGeocoder(options);


function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec;

}

exports.getforecastbyaddress = function(args, res, next) {
  /**
   * Get the forecasts at a certain time (current time by default) of the location indicated by its address
   * 
   *
   * address String Location address (city, postal address...)
   * start_time date Date for the beginning of the forecast. Format: `YYYY-MM-DDThh:mm:ss` (optional)
   * language String Language for the returned properties (optional)
   * returns OutputMessages
   **/
    var toReturn = {};
    toReturn['application/json'] = {
        "messages" : [],
        "location" : {
            "latitude" : null,
            "longitude" : null,
            "name" : args.address.value
        },
        "date": null,
        "result" : {}
    };
    
    var time;
    if (args.start_time.value) {  
        time = args.start_time.value.toISOString().split('.')[0];
    }
    else {
        time = getDateTime();
    }
    toReturn[Object.keys(toReturn)[0]].date = time;
    
    var string1 = "J'ai trouvé la météo de ";
    if (args.language.value!=='fr') string1 = 'I found the wheather in ';
    var string2 = "J'ai trouvé la météo aux coordonnées ";
    if (args.language.value!=='fr') string2 = 'I found the wheather at the coordinates ';
    
    var latitudeFound = null;
    var longitudeFound = null;
    var locationName = null;
    
    geocoder.geocode(args.address.value)
    .then(function(response) {
        latitudeFound = response[0].latitude;
        longitudeFound = response[0].longitude;
        locationName = response[0].city + ', ' + response[0].administrativeLevels.level1long + ', ' + response[0].country;
        toReturn[Object.keys(toReturn)[0]].location.name = locationName;
        toReturn[Object.keys(toReturn)[0]].location.latitude = latitudeFound;
        toReturn[Object.keys(toReturn)[0]].location.longitude = longitudeFound;
        
        superagent.get('https://api.darksky.net/forecast/' + API_KEY + '/' + latitudeFound + ',' + longitudeFound + ',' + time)
        .query({ lang: args.language.value })
        .query({ units: 'auto' })
        .end((r_err, r_res) => {
            res.setHeader('Content-Type', 'application/json');
            if (r_err) {
                console.log(r_err.body);
                res.statusMessage = "Service unavailable";
                res.statusCode = 503;
            }
            else {
                if (locationName) toReturn[Object.keys(toReturn)[0]].messages[0] = string1+locationName+':';
                else toReturn[Object.keys(toReturn)[0]].messages[0] = string2 + 'lat:'+args.latitude.value+', long:'+args.longitude.value+':';
                if (r_res.body.hourly && r_res.body.hourly.summary) {
                    toReturn[Object.keys(toReturn)[0]].messages[1] = r_res.body.hourly.summary;
                }
                else if (r_res.body.daily && r_res.body.daily.summary) {
                    toReturn[Object.keys(toReturn)[0]].messages[1] = r_res.body.daily.summary;
                }
                else if (r_res.body.currently && r_res.body.currently.summary) {
                    toReturn[Object.keys(toReturn)[0]].messages[1] = r_res.body.currently.summary;
                }
                toReturn[Object.keys(toReturn)[0]].result = r_res.body;
            }
            res.end(JSON.stringify(toReturn[Object.keys(toReturn)[0]] || {}, null, 2));
        });
    })
    .catch(function(error) {
        console.log(error);
        res.statusMessage = "Address not recognized";
        res.statusCode = 404;
        res.end(JSON.stringify(toReturn[Object.keys(toReturn)[0]] || {}, null, 2));
    });
};

exports.getforecastbycoords = function(args, res, next) {
  /**
   * Get the forecasts at a certain time (current time by default) of the location indicated by its coordinates
   * 
   *
   * latitude Integer Latitude of the city
   * longitude Integer Longitude of the city
   * start_time date Date for the beginning of the forecast Format: `YYYY-MM-DDThh:mm:ss` (optional)
   * language String Language for the returned properties (optional)
   * returns OutputMessages
   **/
    var toReturn = {};
    toReturn['application/json'] = {
        "messages" : [],
        "location" : {
            "latitude" : args.latitude.value,
            "longitude" : args.longitude.value,
            "name" : null
        },
        "date": null,
        "result" : {}
    };
    
    var time;
    if (args.start_time.value) {  
        time = args.start_time.value.toISOString().split('.')[0];
    }
    else {
        time = getDateTime();
    }
    toReturn[Object.keys(toReturn)[0]].date = time;
    
    var locationName = null;
    
    var addressSearching = true;
    geocoder.reverse({lat:args.latitude.value, lon:args.longitude.value})
    .then(function(response) {
        addressSearching = false;
        locationName = response[0].extra.neighborhood + ', ' + response[0].administrativeLevels.level2long + ', ' + response[0].country;
        toReturn[Object.keys(toReturn)[0]].location.name = locationName;
    })
    .catch(function(error) {
        console.log(error);
        addressSearching = false;
    });
    
    var string1 = "J'ai trouvé la météo de ";
    if (args.language.value!=='fr') string1 = 'I found the wheather in ';
    var string2 = "J'ai trouvé la météo aux coordonnées ";
    if (args.language.value!=='fr') string2 = 'I found the wheather at the coordinates ';

    superagent.get('https://api.darksky.net/forecast/' + API_KEY + '/' + args.latitude.value + ',' + args.longitude.value + ',' + time)
    .query({ lang: args.language.value })
    .query({ units: 'auto' })
    .end((r_err, r_res) => {
        res.setHeader('Content-Type', 'application/json');
        if (r_err) {
            console.log(r_err.body);
            res.statusMessage = "Service unavailable";
            res.statusCode = 503;
        }
        else {
            while (addressSearching); //Wait for location to be identified with google location provider
            if (locationName) toReturn[Object.keys(toReturn)[0]].messages[0] = string1+locationName+':';
            else toReturn[Object.keys(toReturn)[0]].messages[0] = string2 + 'lat:'+args.latitude.value+', long:'+args.longitude.value+':';
            if (r_res.body.hourly && r_res.body.hourly.summary) {
                toReturn[Object.keys(toReturn)[0]].messages[1] = r_res.body.hourly.summary;
            }
            else if (r_res.body.daily && r_res.body.daily.summary) {
                toReturn[Object.keys(toReturn)[0]].messages[1] = r_res.body.daily.summary;
            }
            else if (r_res.body.currently && r_res.body.currently.summary) {
                toReturn[Object.keys(toReturn)[0]].messages[1] = r_res.body.currently.summary;
            }
            toReturn[Object.keys(toReturn)[0]].result = r_res.body;
        }
        res.end(JSON.stringify(toReturn[Object.keys(toReturn)[0]] || {}, null, 2));
    });
};