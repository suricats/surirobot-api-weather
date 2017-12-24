# Weather API for Surirobot

## Overview
This API uses Forecast API to retrieve weather for a given location

## Requirements
* NodeJs >= 8

## Setup
Run in the console:
```
git clone git@gitlab.com:surirobot/weather-api.git
cd weather-api
npm install
cp src/config.js.example src/config.js
```

Fill src/config.js with your Recast API KEY and choose the server port or use the suri downloader:

```
cp .env.example .env
nano .env
tools/get-credentials.sh
```

### Running the server
To run the server, run:

```
npm start
```

### Documentation
To view the Swagger UI interface, open a browser and access:
```
https://weather.api.surirobot.net/docs
```

You can also find the Swagger file at:
```
api/swagger.yaml
```
