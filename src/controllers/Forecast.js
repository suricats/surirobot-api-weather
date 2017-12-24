'use strict';

var url = require('url');

var Forecast = require('./ForecastService');

module.exports.getforecastbyaddress = function getforecastbyaddress (req, res, next) {
  Forecast.getforecastbyaddress(req.swagger.params, res, next);
};

module.exports.getforecastbycoords = function getforecastbycoords (req, res, next) {
  Forecast.getforecastbycoords(req.swagger.params, res, next);
};
